from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("accounts", "0002_phone_verification")]

    operations = [
        migrations.AddField(model_name="user", name="email_verified", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="user", name="email_verification_code", field=models.CharField(blank=True, max_length=128)),
        migrations.AddField(model_name="user", name="email_verification_expires_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="user", name="email_verification_sent_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="user", name="email_verification_attempts", field=models.PositiveSmallIntegerField(default=0)),
        migrations.AddField(model_name="user", name="password_reset_requested_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="user", name="login_alert_sent_at", field=models.DateTimeField(blank=True, null=True)),
    ]
