package com.projet.dev.models;

public enum Permission {

    // ================= ADMIN =================
    ADMIN_READ("admin:read"),
    ADMIN_CREATE("admin:create"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_DELETE("admin:delete"),
    ADMIN_MANAGE_ROLES("admin:manage_roles"),
    ADMIN_MANAGE_PERMISSIONS("admin:manage_permissions"),

    // ================= SCOLARITE =================
    SCOLARITE_READ("scolarite:read"),
    SCOLARITE_CREATE("scolarite:create"),
    SCOLARITE_UPDATE("scolarite:update"),
    SCOLARITE_DELETE("scolarite:delete"),
    SCOLARITE_MANAGE_NOTES("scolarite:manage_notes"),
    SCOLARITE_MANAGE_INSCRIPTIONS("scolarite:manage_inscriptions"),

    // ================= ENSEIGNANT =================
    ENSEIGNANT_READ("enseignant:read"),
    ENSEIGNANT_GRADE_STUDENT("enseignant:grade_student"),
    ENSEIGNANT_UPDATE_NOTES("enseignant:update_notes"),
    ENSEIGNANT_VIEW_CLASSES("enseignant:view_classes"),

    // ================= ETUDIANT =================
    ETUDIANT_READ_PROFILE("etudiant:read_profile"),
    ETUDIANT_VIEW_NOTES("etudiant:view_notes"),
    ETUDIANT_VIEW_UE("etudiant:view_ue");

    private final String permission;

    Permission(String permission) {
        this.permission = permission;
    }

    public String getPermission() {
        return permission;
    }
}
