"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, AlertTriangle, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { logout, userRole } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [showDeleteSection, setShowDeleteSection] = React.useState(false);
  const [confirmEmail, setConfirmEmail] = React.useState("");
  const [deleteStep, setDeleteStep] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");
  const canManage = userRole === 'admin' || userRole === 'operator' || userRole === 'superuser';

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleRevealDelete = () => {
    setDeleteStep(1);
    setShowDeleteSection(true);
  };

  const handleFirstConfirm = () => {
    setDeleteStep(2);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmEmail(e.target.value);
  };

  const handleFinalConfirm = async () => {
    if (confirmEmail.toLowerCase() !== userEmail.toLowerCase()) {
      setDeleteError("Email does not match your account email");
      return;
    }
    setDeleteStep(3);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.delete('/users/me');
      logout();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || "Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteStep(0);
    setShowDeleteSection(false);
    setConfirmEmail("");
    setDeleteError("");
  };

  const userEmail = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    const token = localStorage.getItem("ssc_token");
    if (!token) return "";
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return "";
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.email || "";
    } catch {
      return "";
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      </div>

      <section className="space-y-2 mb-6">
        <h2 className="font-medium">Appearance</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="radio" name="theme" checked={mounted && resolvedTheme === 'light'} onChange={() => setTheme('light')} />
            <span className="ml-1">Light</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="theme" checked={mounted && resolvedTheme === 'dark'} onChange={() => setTheme('dark')} />
            <span className="ml-1">Dark</span>
          </label>
        </div>
      </section>

      {canManage && (
        <section className="mb-6">
          <h2 className="font-medium">User Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage members, students, professors, and view audit history.
          </p>
          <Link href="/dashboard/users/manage" className="mt-3 inline-block">
            <Button variant="outline" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Go to User Management
            </Button>
          </Link>
        </section>
      )}

      <div className="mt-8">
        <button className="w-full p-3 rounded bg-destructive text-white" onClick={() => { logout(); }}>
          Log out
        </button>
      </div>

      {/* Delete Account Section - at the very bottom, visually separated */}
      {!showDeleteSection ? (
        <section className="mt-6 pt-6 border-t">
          <button
            onClick={handleRevealDelete}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete my account
          </button>
        </section>
      ) : (
        <section className="mt-6 pt-6 border-t border-destructive/30 rounded-lg p-4 bg-destructive/5">
          {deleteStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This action is <strong>permanent</strong>. All your data will be permanently deleted and cannot be recovered.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelDelete} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleFirstConfirm} className="flex-1">
                  I understand, continue
                </Button>
              </div>
            </div>
          )}

          {deleteStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive">Confirm Deletion</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Type your email <strong>{userEmail || "your email"}</strong> to confirm deletion:
                  </p>
                </div>
              </div>
              <input
                type="email"
                placeholder="Type your email to confirm"
                value={confirmEmail}
                onChange={handleEmailChange}
                className="w-full p-2 border border-destructive/50 rounded bg-background text-sm"
              />
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelDelete} className="flex-1">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleFinalConfirm}
                  disabled={!confirmEmail}
                  className="flex-1"
                >
                  Delete my account
                </Button>
              </div>
            </div>
          )}

          {deleteStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-bold text-destructive text-lg">Final Confirmation</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Are you absolutely sure? This action <strong>cannot be undone</strong>.
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>- Your profile and personal data will be deleted</li>
                    <li>- Your access history will be permanently removed</li>
                    <li>- Any associated records will be lost forever</li>
                  </ul>
                </div>
              </div>
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelDelete} className="flex-1" disabled={isDeleting}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 font-bold"
                >
                  {isDeleting ? "Deleting..." : "Yes, delete forever"}
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}