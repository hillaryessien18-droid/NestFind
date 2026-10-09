from unittest.mock import Mock, patch

from django.test import SimpleTestCase, override_settings

from .email_delivery import send_transactional_email


class TransactionalEmailTests(SimpleTestCase):
    @override_settings(
        EMAIL_DELIVERY_PROVIDER="brevo",
        BREVO_API_KEY="test-api-key",
        DEFAULT_FROM_EMAIL="hello@example.com",
        DEFAULT_FROM_NAME="NestFind",
    )
    @patch("core.email_delivery.requests.post")
    def test_brevo_uses_https_with_branded_html(self, post):
        post.return_value = Mock(status_code=201)

        sent = send_transactional_email(
            recipient="customer@example.com",
            recipient_name="Customer",
            subject="Welcome to NestFind",
            greeting="Hello Customer,",
            paragraphs=["Your account is ready."],
            action_label="Explore homes",
            action_url="https://nest-find-alpha.vercel.app/properties",
        )

        self.assertTrue(sent)
        self.assertEqual(post.call_args.args[0], "https://api.brevo.com/v3/smtp/email")
        self.assertEqual(post.call_args.kwargs["headers"]["api-key"], "test-api-key")
        payload = post.call_args.kwargs["json"]
        self.assertEqual(payload["sender"]["email"], "hello@example.com")
        self.assertEqual(payload["to"][0]["email"], "customer@example.com")
        self.assertNotIn("textContent", payload)
        self.assertIn("Your account is ready.", payload["htmlContent"])

    @override_settings(EMAIL_DELIVERY_PROVIDER="brevo", BREVO_API_KEY="")
    @patch("core.email_delivery.requests.post")
    def test_missing_api_key_does_not_send(self, post):
        sent = send_transactional_email(
            recipient="customer@example.com",
            recipient_name="Customer",
            subject="Welcome to NestFind",
            greeting="Hello Customer,",
            paragraphs=["Your account is ready."],
        )

        self.assertFalse(sent)
        post.assert_not_called()
