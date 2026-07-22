"use client";

import { Archive, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getUserFacingDatabaseError } from "@/lib/user-facing-errors";
import { createClient } from "@/lib/supabase/client";
import type { HomeStatus } from "@/types/schemas";

export function HomeActions({
  homeId,
  status,
  photoPaths,
}: {
  homeId: string;
  status: HomeStatus | null;
  photoPaths: string[];
}) {
  const router = useRouter();
  const [action, setAction] = useState<"disable" | "delete" | null>(null);
  const [error, setError] = useState("");

  async function disableHome() {
    setAction("disable");
    setError("");
    const { error: updateError } = await createClient()
      .from("homes")
      .update({ status: "archived" })
      .eq("id", homeId)
      .eq("status", "active");

    if (updateError) {
      setError(getUserFacingDatabaseError(updateError, "Unable to disable this home."));
      setAction(null);
      return;
    }

    router.refresh();
  }

  async function deleteHome() {
    if (!window.confirm("Delete this home permanently? This cannot be undone.")) return;

    setAction("delete");
    setError("");
    const supabase = createClient();

    if (photoPaths.length > 0) {
      const { error: storageError } = await supabase.storage.from("home-photos").remove(photoPaths);

      if (storageError) {
        setError(getUserFacingDatabaseError(storageError, "Unable to delete this home."));
        setAction(null);
        return;
      }
    }

    const { error: deleteError } = await supabase.from("homes").delete().eq("id", homeId);

    if (deleteError) {
      setError(getUserFacingDatabaseError(deleteError, "Unable to delete this home."));
      setAction(null);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-6 border-t pt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Manage your home</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Disable it to stop appearing in discovery, or delete it permanently.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={action !== null}
              onClick={() => void disableHome()}
            >
              <Archive /> {action === "disable" ? "Disabling..." : "Disable home"}
            </Button>
          ) : null}
          <Button
            variant="destructive"
            size="sm"
            disabled={action !== null}
            onClick={() => void deleteHome()}
          >
            <Trash2 /> {action === "delete" ? "Deleting..." : "Delete home"}
          </Button>
        </div>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
