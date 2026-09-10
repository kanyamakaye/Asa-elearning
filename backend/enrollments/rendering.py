"""Renders a student's academic transcript as a portrait PDF. Same Pillow-
only approach as certificates/rendering.py (no extra PDF dependency), and
reuses that module's brand-mark asset for a consistent look.
"""

from io import BytesIO

from django.utils import timezone
from PIL import Image, ImageDraw, ImageFont

from certificates.rendering import LOGO_HEIGHT, load_logo

# A4 portrait at 200 DPI.
WIDTH, HEIGHT = 1653, 2338
DPI = 200

NAVY = (10, 20, 64)
GOLD = (180, 140, 46)
CREAM = (252, 250, 244)
MUTED = (100, 108, 140)
LINE = (222, 220, 212)
ROW_ALT = (247, 246, 241)

FONT_PATHS = {
    'bold': 'C:/Windows/Fonts/arialbd.ttf',
    'regular': 'C:/Windows/Fonts/arial.ttf',
    'italic': 'C:/Windows/Fonts/ariali.ttf',
}


def load_font(kind, size):
    try:
        return ImageFont.truetype(FONT_PATHS[kind], size)
    except OSError:
        return ImageFont.load_default()


def truncate(draw, text, font, max_width):
    if draw.textlength(text, font=font) <= max_width:
        return text
    ellipsis = '…'
    while text and draw.textlength(text + ellipsis, font=font) > max_width:
        text = text[:-1]
    return text + ellipsis


# Column layout for the course table, as (label, width) pairs — widths sum to
# the table's content width.
COLUMNS = [
    ('Course', 0.36),
    ('Level', 0.10),
    ('Hours', 0.08),
    ('Status', 0.13),
    ('Completed', 0.13),
    ('Grade', 0.10),
    ('Cert.', 0.10),
]


def render_transcript_image(data):
    student = data['student']
    courses = data['courses']
    summary = data['summary']

    img = Image.new('RGB', (WIDTH, HEIGHT), CREAM)
    draw = ImageDraw.Draw(img)
    cx = WIDTH // 2

    margin = 56
    draw.rectangle([margin, margin, WIDTH - margin, HEIGHT - margin], outline=NAVY, width=6)
    inner = margin + 22
    content_left, content_right = inner + 30, WIDTH - inner - 30

    y = inner + 50
    logo = load_logo()
    if logo:
        img.paste(logo, (content_left, y), logo)
    draw.text((content_left + (logo.width + 24 if logo else 0), y + 10), 'ASA ACADEMY', font=load_font('bold', 36), fill=NAVY)
    draw.text(
        (content_left + (logo.width + 24 if logo else 0), y + 56), 'Official Academic Transcript',
        font=load_font('regular', 24), fill=MUTED,
    )
    issued_text = f'Issued {timezone.now().strftime("%B %d, %Y")}'
    iw = draw.textlength(issued_text, font=load_font('regular', 20))
    draw.text((content_right - iw, y + 20), issued_text, font=load_font('regular', 20), fill=MUTED)

    y += LOGO_HEIGHT + 30
    draw.line([(content_left, y), (content_right, y)], fill=GOLD, width=3)
    y += 30

    # Student info block.
    draw.text((content_left, y), 'Student', font=load_font('bold', 18), fill=MUTED)
    draw.text((content_left, y + 26), student.full_name, font=load_font('bold', 30), fill=NAVY)
    draw.text((content_left, y + 66), student.email, font=load_font('regular', 20), fill=MUTED)
    y += 110

    # Summary stat cards.
    stats = [
        ('Courses Enrolled', str(summary['total_courses'])),
        ('Courses Completed', str(summary['completed_courses'])),
        ('Hours Completed', str(summary['total_hours_completed'])),
        ('Overall Average', f"{summary['overall_average']}%" if summary['overall_average'] is not None else '—'),
        ('Certificates Earned', str(summary['certificates_earned'])),
    ]
    card_w = (content_right - content_left - (len(stats) - 1) * 16) / len(stats)
    card_h = 100
    for i, (label, value) in enumerate(stats):
        x0 = content_left + i * (card_w + 16)
        draw.rounded_rectangle([x0, y, x0 + card_w, y + card_h], radius=10, outline=LINE, width=2)
        vfont = load_font('bold', 32)
        vw = draw.textlength(value, font=vfont)
        draw.text((x0 + card_w / 2 - vw / 2, y + 16), value, font=vfont, fill=NAVY)
        lfont = load_font('regular', 15)
        lines = label.split(' ')
        lw = draw.textlength(label, font=lfont)
        if lw > card_w - 12 and len(lines) > 1:
            mid = len(lines) // 2
            line1, line2 = ' '.join(lines[:mid]), ' '.join(lines[mid:])
            for j, line in enumerate((line1, line2)):
                w = draw.textlength(line, font=lfont)
                draw.text((x0 + card_w / 2 - w / 2, y + 60 + j * 18), line, font=lfont, fill=MUTED)
        else:
            draw.text((x0 + card_w / 2 - lw / 2, y + 68), label, font=lfont, fill=MUTED)
    y += card_h + 40

    # Course table.
    draw.text((content_left, y), 'Course Record', font=load_font('bold', 22), fill=NAVY)
    y += 36

    table_width = content_right - content_left
    row_count = max(len(courses), 1)
    available = HEIGHT - inner - 90 - y
    row_h = max(34, min(58, available / (row_count + 1)))
    body_font_size = 18 if row_h >= 44 else 15
    header_font = load_font('bold', body_font_size)
    body_font = load_font('regular', body_font_size)
    bold_body_font = load_font('bold', body_font_size)

    col_x = [content_left]
    for _, frac in COLUMNS:
        col_x.append(col_x[-1] + table_width * frac)

    header_y = y
    draw.rectangle([content_left, header_y, content_right, header_y + row_h], fill=NAVY)
    for i, (label, _) in enumerate(COLUMNS):
        draw.text((col_x[i] + 10, header_y + row_h / 2 - body_font_size / 2), label, font=header_font, fill=(255, 255, 255))
    y = header_y + row_h

    status_labels = {'completed': 'Completed', 'active': 'In Progress', 'pending': 'Pending', 'cancelled': 'Cancelled', 'suspended': 'Suspended'}

    for i, course in enumerate(courses):
        if i % 2 == 1:
            draw.rectangle([content_left, y, content_right, y + row_h], fill=ROW_ALT)
        title = truncate(draw, course['course_title'], bold_body_font, table_width * COLUMNS[0][1] - 20)
        completed_text = course['completed_at'].strftime('%b %d, %Y') if course['completed_at'] else '—'
        grade_text = f"{course['letter_grade']} ({course['grade_percentage']}%)" if course['grade_percentage'] is not None else '—'
        cert_text = 'Yes' if course['certificate_issued'] else '—'
        values = [
            (title, bold_body_font),
            (course['level'], body_font),
            (str(course['duration_hours']), body_font),
            (status_labels.get(course['status'], course['status'].title()), body_font),
            (completed_text, body_font),
            (grade_text, body_font),
            (cert_text, body_font),
        ]
        for j, (text, font) in enumerate(values):
            fill = NAVY if j == 0 else MUTED
            draw.text((col_x[j] + 10, y + row_h / 2 - body_font_size / 2), text, font=font, fill=fill)
        y += row_h

    draw.line([(content_left, y), (content_right, y)], fill=LINE, width=2)

    footer_text = 'This transcript reflects the student\u2019s academic record on the Asa Academy e-learning platform.'
    ffont = load_font('italic', 18)
    fw = draw.textlength(footer_text, font=ffont)
    draw.text((cx - fw / 2, HEIGHT - inner - 40), footer_text, font=ffont, fill=MUTED)

    return img


def generate_transcript_pdf(data):
    img = render_transcript_image(data)
    buffer = BytesIO()
    img.save(buffer, format='PDF', resolution=DPI)
    return buffer.getvalue()
