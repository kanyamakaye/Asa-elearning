from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from courses.models import Course, CourseCategory
from enrollments.models import Enrollment

from .authorization import can_message, get_allowed_contacts
from .models import Conversation, ConversationParticipant, Message

User = get_user_model()


def make_user(username, user_type='student', **kwargs):
    return User.objects.create_user(
        username=username, email=f'{username}@example.com', password='Passw0rd!123',
        user_type=user_type, status='active', **kwargs,
    )


class MessagingAuthorizationTests(TestCase):
    """Covers Messages spec §4/§17/§28 — role-scoped contact lists."""

    def setUp(self):
        self.category = CourseCategory.objects.create(name='Test Category')
        self.instructor = make_user('inst1', user_type='instructor')
        self.other_instructor = make_user('inst2', user_type='instructor')
        self.admin = make_user('admin1', user_type='admin')
        self.student = make_user('stud1', user_type='student')
        self.unrelated_student = make_user('stud2', user_type='student')

        self.course = Course.objects.create(
            title='Test Course', category=self.category, instructor=self.instructor, status='published',
        )
        Enrollment.objects.create(student=self.student, course=self.course)

    def test_student_can_message_enrolled_courses_instructor(self):
        self.assertTrue(can_message(self.student, self.instructor))

    def test_student_cannot_message_unrelated_instructor(self):
        self.assertFalse(can_message(self.student, self.other_instructor))

    def test_student_can_message_admin(self):
        self.assertTrue(can_message(self.student, self.admin))

    def test_student_cannot_message_unrelated_student(self):
        self.assertFalse(can_message(self.student, self.unrelated_student))

    def test_instructor_can_message_own_student(self):
        self.assertTrue(can_message(self.instructor, self.student))

    def test_instructor_cannot_message_unrelated_student(self):
        self.assertFalse(can_message(self.instructor, self.unrelated_student))

    def test_instructor_can_message_admin(self):
        self.assertTrue(can_message(self.instructor, self.admin))

    def test_admin_can_message_anyone(self):
        self.assertTrue(can_message(self.admin, self.student))
        self.assertTrue(can_message(self.admin, self.instructor))
        self.assertTrue(can_message(self.admin, self.unrelated_student))

    def test_allowed_contacts_excludes_self(self):
        self.assertNotIn(self.student, get_allowed_contacts(self.student))


class MessagingAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = CourseCategory.objects.create(name='API Test Category')
        self.instructor = make_user('api_inst', user_type='instructor')
        self.admin = make_user('api_admin', user_type='admin')
        self.student = make_user('api_stud', user_type='student')
        self.other_student = make_user('api_stud2', user_type='student')
        self.unrelated_instructor = make_user('api_inst2', user_type='instructor')

        self.course = Course.objects.create(
            title='API Course', category=self.category, instructor=self.instructor, status='published',
        )
        Enrollment.objects.create(student=self.student, course=self.course)

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_student_can_start_conversation_with_authorized_instructor(self):
        self._auth(self.student)
        res = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.instructor.id, 'message': 'Hello, question about lesson 4.',
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(Message.objects.first().content, 'Hello, question about lesson 4.')

    def test_student_can_message_admin(self):
        self._auth(self.student)
        res = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.admin.id, 'message': 'Need help with billing.',
        }, format='json')
        self.assertEqual(res.status_code, 201)

    def test_student_cannot_start_conversation_with_unrelated_instructor(self):
        self._auth(self.student)
        res = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.unrelated_instructor.id, 'message': 'Hi there.',
        }, format='json')
        self.assertEqual(res.status_code, 403)
        self.assertEqual(Conversation.objects.count(), 0)

    def test_instructor_cannot_message_unrelated_student(self):
        self._auth(self.unrelated_instructor)
        res = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.student.id, 'message': 'Hi.',
        }, format='json')
        self.assertEqual(res.status_code, 403)

    def test_cannot_send_empty_message(self):
        self._auth(self.student)
        res = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.instructor.id, 'message': '   ',
        }, format='json')
        self.assertEqual(res.status_code, 400)

    def test_duplicate_conversation_is_reused_not_duplicated(self):
        self._auth(self.student)
        first = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.instructor.id, 'message': 'First message.',
        }, format='json')
        second = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.instructor.id, 'message': 'Second message.',
        }, format='json')
        self.assertEqual(first.data['id'], second.data['id'])
        self.assertEqual(Conversation.objects.count(), 1)
        self.assertEqual(Message.objects.filter(conversation_id=first.data['id']).count(), 2)

    def test_recipient_receives_message_and_reply_works(self):
        self._auth(self.student)
        create_res = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.instructor.id, 'message': 'Question about the assignment.',
        }, format='json')
        conversation_id = create_res.data['id']

        self._auth(self.instructor)
        list_res = self.client.get('/api/v1/messages/conversations/')
        self.assertEqual(list_res.status_code, 200)
        rows = list_res.data['results'] if isinstance(list_res.data, dict) else list_res.data
        ids = [c['id'] for c in rows]
        self.assertIn(conversation_id, ids)

        reply_res = self.client.post(f'/api/v1/messages/conversations/{conversation_id}/messages/', {
            'content': 'Sure — what part is confusing you?',
        }, format='json')
        self.assertEqual(reply_res.status_code, 201)
        self.assertEqual(Message.objects.filter(conversation_id=conversation_id).count(), 2)

    def test_student_cannot_access_another_students_conversation(self):
        self._auth(self.student)
        create_res = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.instructor.id, 'message': 'Private question.',
        }, format='json')
        conversation_id = create_res.data['id']

        self._auth(self.other_student)
        res = self.client.get(f'/api/v1/messages/conversations/{conversation_id}/messages/')
        self.assertEqual(res.status_code, 404)

        list_res = self.client.get('/api/v1/messages/conversations/')
        rows = list_res.data['results'] if isinstance(list_res.data, dict) else list_res.data
        ids = [c['id'] for c in rows]
        self.assertNotIn(conversation_id, ids)

    def test_mark_read_updates_unread_count(self):
        self._auth(self.student)
        create_res = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.instructor.id, 'message': 'Hello!',
        }, format='json')
        conversation_id = create_res.data['id']

        self._auth(self.instructor)
        unread_res = self.client.get('/api/v1/messages/unread-count/')
        self.assertEqual(unread_res.data['unread_count'], 1)

        self.client.get(f'/api/v1/messages/conversations/{conversation_id}/messages/')  # loading alone doesn't mark read
        self.client.post(f'/api/v1/messages/conversations/{conversation_id}/read/')
        unread_res2 = self.client.get('/api/v1/messages/unread-count/')
        self.assertEqual(unread_res2.data['unread_count'], 0)

    def test_contacts_endpoint_is_role_scoped(self):
        self._auth(self.student)
        res = self.client.get('/api/v1/messages/contacts/')
        ids = [c['id'] for c in res.data]
        self.assertIn(self.instructor.id, ids)
        self.assertIn(self.admin.id, ids)
        self.assertNotIn(self.unrelated_instructor.id, ids)
        self.assertNotIn(self.other_student.id, ids)

    def test_search_conversations_by_message_content(self):
        self._auth(self.student)
        self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.instructor.id, 'message': 'Discussing the midterm exam.',
        }, format='json')
        self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.admin.id, 'message': 'Billing question.',
        }, format='json')

        res = self.client.get('/api/v1/messages/conversations/?search=midterm')
        rows = res.data['results'] if isinstance(res.data, dict) else res.data
        self.assertEqual(len(rows), 1)

    def test_admin_can_message_student_and_instructor(self):
        self._auth(self.admin)
        r1 = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.student.id, 'message': 'Welcome to Asa Academy!',
        }, format='json')
        r2 = self.client.post('/api/v1/messages/conversations/', {
            'recipient': self.instructor.id, 'message': 'Please review the new policy.',
        }, format='json')
        self.assertEqual(r1.status_code, 201)
        self.assertEqual(r2.status_code, 201)

    def test_unauthenticated_request_rejected(self):
        res = self.client.get('/api/v1/messages/conversations/')
        self.assertEqual(res.status_code, 401)
