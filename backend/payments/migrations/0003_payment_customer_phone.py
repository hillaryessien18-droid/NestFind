from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("payments", "0002_tenantdetail")]

    operations = [
        migrations.AddField(
            model_name="paymenttransaction",
            name="customer_phone",
            field=models.CharField(blank=True, max_length=20),
        ),
    ]
