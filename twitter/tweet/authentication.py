from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session auth that skips CSRF checks — safe for CORS-protected API."""
    def enforce_csrf(self, request):
        return  # skip CSRF
