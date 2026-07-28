from rest_framework import permissions


class IsPropertyOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class IsHost(permissions.BasePermission):
    message = "Only hosts can manage property listings."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "host"


class IsEnquiryRecipient(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.sender == request.user or obj.host == request.user
        return obj.host == request.user
