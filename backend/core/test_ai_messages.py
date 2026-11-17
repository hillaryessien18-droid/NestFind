from types import SimpleNamespace
from unittest.mock import Mock, patch

import requests
from django.test import SimpleTestCase, override_settings

from core.ai_messages import generate_messages, payment_messages, welcome_messages

FALLBACK = {"email_intro": "Fixed intro.", "notification": "Fixed note."}
AI_ON = {"AI_MESSAGES_ENABLED": True, "ANTHROPIC_API_KEY": "test-key",
         "AI_MESSAGES_MODEL": "test-model", "AI_MESSAGES_TIMEOUT": 1}


def ai_reply(text):
    response = Mock()
    response.raise_for_status.return_value = None
    response.json.return_value = {"content": [{"type": "text", "text": text}]}
    return response


@override_settings(**AI_ON)
class AIMessageTests(SimpleTestCase):
    @patch("core.ai_messages.requests.post")
    def test_uses_ai_wording_when_valid(self, post):
        post.return_value = ai_reply(
            '{"email_intro": "Welcome aboard, Amara! We are glad you are here.", '
            '"notification": "Welcome, Amara. Verify your details to get started."}'
        )
        result = generate_messages("welcome", {"first_name": "Amara"}, FALLBACK)
        self.assertEqual(result["email_intro"], "Welcome aboard, Amara! We are glad you are here.")
        self.assertEqual(result["notification"], "Welcome, Amara. Verify your details to get started.")
        self.assertEqual(post.call_args.kwargs["headers"]["x-api-key"], "test-key")

    @patch("core.ai_messages.requests.post")
    def test_rejects_invented_amounts_links_and_markdown(self, post):
        post.return_value = ai_reply(
            '{"email_intro": "You paid NGN 500,000 today.", "notification": "See https://x.y **now**"}'
        )
        self.assertEqual(generate_messages("payment", {}, FALLBACK), FALLBACK)

    @patch("core.ai_messages.requests.post")
    def test_allows_digits_that_come_from_the_property_title(self, post):
        post.return_value = ai_reply(
            '{"email_intro": "Congratulations on 3 Bedroom Flat in Lekki.", "notification": "Your 3 Bedroom Flat is confirmed."}'
        )
        result = generate_messages("payment", {"property": "3 Bedroom Flat"}, FALLBACK)
        self.assertEqual(result["notification"], "Your 3 Bedroom Flat is confirmed.")

    @patch("core.ai_messages.requests.post", side_effect=requests.Timeout())
    def test_falls_back_when_provider_fails(self, _post):
        self.assertEqual(generate_messages("welcome", {}, FALLBACK), FALLBACK)

    @patch("core.ai_messages.requests.post")
    def test_falls_back_on_non_json_reply(self, post):
        post.return_value = ai_reply("Sure! Here you go: Welcome!")
        self.assertEqual(generate_messages("welcome", {}, FALLBACK), FALLBACK)

    @override_settings(ANTHROPIC_API_KEY="")
    @patch("core.ai_messages.requests.post")
    def test_no_api_call_without_key(self, post):
        user = SimpleNamespace(first_name="Ada", role="host")
        result = welcome_messages(user)
        post.assert_not_called()
        self.assertIn("create your first listing", result["notification"])

    @patch("core.ai_messages.requests.post")
    def test_payment_prompt_never_includes_amount_or_reference(self, post):
        post.return_value = ai_reply('{"email_intro": "Done.", "notification": "Done."}')
        booking = SimpleNamespace(
            booking_type="rent", amount=750000, months=12,
            property=SimpleNamespace(title="Lekki Duplex", city="Lagos", state="Lagos"),
        )
        payment_messages(SimpleNamespace(first_name="Tunde", role="tenant"), booking)
        prompt = post.call_args.kwargs["json"]["messages"][0]["content"]
        self.assertIn("Lekki Duplex", prompt)
        self.assertNotIn("750", prompt)
