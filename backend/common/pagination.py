from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Default pagination for the whole API. Adds client-controlled page size
    (?page_size=N) on top of DRF's PageNumberPagination, which otherwise
    ignores that query param entirely — every "give me more per page" call
    across the frontend (course/assignment/quiz management lists requesting
    page_size=100/200) was silently capped at PAGE_SIZE=20 without this."""

    page_size_query_param = 'page_size'
    max_page_size = 200
