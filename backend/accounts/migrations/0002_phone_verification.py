from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("accounts", "0001_initial")]

    operations = [
        migrations.AddField(model_name="user", name="phone_verified", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="user", name="phone_verification_code", field=models.CharField(blank=True, max_length=128)),
        migrations.AddField(model_name="user", name="phone_verification_expires_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="user", name="phone_verification_sent_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="user", name="phone_verification_attempts", field=models.PositiveSmallIntegerField(default=0)),
    ]
