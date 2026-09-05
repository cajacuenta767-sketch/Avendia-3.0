import { useState } from "react";

import { readSessionUser } from "../../lib/session";
import { useDashboardActivity } from "./dashboardActivity";
import { HomeDashboardContent } from "./HomeDashboardContent";
import { NewCreationDialog } from "./NewCreationDialog";

export function DashboardPage() {
  const [creationOpen, setCreationOpen] = useState(false);
  const user = readSessionUser();
  const { activity, loading } = useDashboardActivity();

  return (
    <>
      <HomeDashboardContent user={user} activity={activity} activityLoading={loading} onNewCreation={() => setCreationOpen(true)} />
      <NewCreationDialog open={creationOpen} onClose={() => setCreationOpen(false)} />
    </>
  );
}
