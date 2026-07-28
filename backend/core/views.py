from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class HostDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "host":
            return Response(
                {"error": "Only hosts can access the dashboard."},
                status=status.HTTP_403_FORBIDDEN,
            )

        properties = user.properties.all()
        total_properties = properties.count()
        active_properties = properties.filter(status="active").count()
        total_views = properties.aggregate(total=Sum("views_count"))["total"] or 0
        total_enquiries = user.received_enquiries.count()
        pending_enquiries = user.received_enquiries.filter(status="pending").count()
        avg_rating = properties.aggregate(avg=Avg("reviews__rating"))["avg"]

        recent_enquiries = user.received_enquiries.select_related(
            "property", "sender"
        )[:10]

        top_properties = properties.order_by("-views_count")[:5]

        today = timezone.now()
        thirty_days_ago = today - timedelta(days=30)

        views_by_property = []
        for prop in top_properties:
            views_by_property.append({
                "title": prop.title,
                "views": prop.views_count,
            })

        enquiries_by_status = {
            "pending": pending_enquiries,
            "responded": user.received_enquiries.filter(status="responded").count(),
            "closed": user.received_enquiries.filter(status="closed").count(),
        }

        return Response({
            "summary": {
                "total_properties": total_properties,
                "active_properties": active_properties,
                "total_views": total_views,
                "total_enquiries": total_enquiries,
                "pending_enquiries": pending_enquiries,
                "average_rating": round(avg_rating, 1) if avg_rating else 0,
            },
            "views_by_property": views_by_property,
            "enquiries_by_status": enquiries_by_status,
            "recent_enquiries": [
                {
                    "id": str(e.id),
                    "property": e.property.title,
                    "sender": e.sender.full_name or e.sender.email,
                    "message": e.message[:100],
                    "status": e.status,
                    "created_at": e.created_at.isoformat(),
                }
                for e in recent_enquiries
            ],
        })


class PlatformStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from properties.models import Property, Review, Enquiry

        return Response({
            "total_properties": Property.objects.filter(status="active").count(),
            "total_users": User.objects.count(),
            "total_hosts": User.objects.filter(role="host").count(),
            "total_reviews": Review.objects.count(),
            "total_enquiries": Enquiry.objects.count(),
        })
