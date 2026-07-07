"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "../../../../components/layout/Header";
import { getHaClient } from "../../../../lib/ha/client";
import adminStyles from "../../../../components/admin/admin.module.css";

interface Notification {
  notification_id: string;
  title?: string;
  message: string;
  created_at: string;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications, isFetching } = useQuery({
    queryKey: ["persistent_notifications"],
    refetchInterval: 5000,
    queryFn: () => getHaClient().command<Notification[]>({ type: "persistent_notification/get" })
  });

  async function dismiss(id: string) {
    try {
      await getHaClient().callService("persistent_notification", "dismiss", undefined, { notification_id: id });
      void queryClient.invalidateQueries({ queryKey: ["persistent_notifications"] });
    } catch (err) {
      console.error("[dismiss notification]", err);
    }
  }

  return (
    <>
      <Header title="Notifications" summary={notifications ? `${notifications.length} active` : undefined} showEdit={false} />
      <div className={adminStyles.tableWrap}>
        <div className={adminStyles.tableScroll} style={{ height: 520 }}>
          {isFetching && !notifications ? (
            <div className={adminStyles.empty}>Loading…</div>
          ) : !notifications || notifications.length === 0 ? (
            <div className={adminStyles.empty}>No active notifications.</div>
          ) : (
            notifications.map((n) => (
              <div key={n.notification_id} className={adminStyles.tableRow} style={{ cursor: "default", padding: "12px 16px", height: "auto" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{n.title ?? n.notification_id}</div>
                  <div style={{ fontSize: 12.5, opacity: 0.65, marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: 11, opacity: 0.4, marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <button className={adminStyles.button} onClick={() => dismiss(n.notification_id)}>
                  Dismiss
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
