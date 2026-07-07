"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "../../../../components/layout/Header";
import { getHaClient } from "../../../../lib/ha/client";
import adminStyles from "../../../../components/admin/admin.module.css";

interface Person {
  id: string;
  name: string;
  user_id: string | null;
  device_trackers: string[];
}

interface Zone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  icon?: string;
}

export default function PeopleZonesPage() {
  const queryClient = useQueryClient();
  const { data: people } = useQuery({ queryKey: ["people"], queryFn: () => getHaClient().command<Person[]>({ type: "config/person/list" }) });
  const { data: zones } = useQuery({ queryKey: ["zones"], queryFn: () => getHaClient().command<Zone[]>({ type: "config/zone/list" }) });

  const [personName, setPersonName] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [zoneLat, setZoneLat] = useState("");
  const [zoneLon, setZoneLon] = useState("");
  const [zoneRadius, setZoneRadius] = useState("100");
  const [error, setError] = useState<string | null>(null);

  function refreshPeople() {
    void queryClient.invalidateQueries({ queryKey: ["people"] });
  }
  function refreshZones() {
    void queryClient.invalidateQueries({ queryKey: ["zones"] });
  }

  async function addPerson() {
    if (!personName.trim()) return;
    setError(null);
    try {
      await getHaClient().command({ type: "config/person/create", name: personName.trim() });
      setPersonName("");
      refreshPeople();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }
  async function removePerson(id: string) {
    if (!confirm("Remove this person?")) return;
    setError(null);
    try {
      await getHaClient().command({ type: "config/person/delete", person_id: id });
      refreshPeople();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function addZone() {
    if (!zoneName.trim() || !zoneLat || !zoneLon) return;
    setError(null);
    try {
      await getHaClient().command({
        type: "config/zone/create",
        name: zoneName.trim(),
        latitude: Number(zoneLat),
        longitude: Number(zoneLon),
        radius: Number(zoneRadius) || 100,
        passive: false
      });
      setZoneName("");
      setZoneLat("");
      setZoneLon("");
      refreshZones();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }
  async function removeZone(id: string) {
    if (!confirm("Remove this zone?")) return;
    setError(null);
    try {
      await getHaClient().command({ type: "config/zone/delete", zone_id: id });
      refreshZones();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <Header title="People & Zones" showEdit={false} />
      {error ? <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 14 }}>{error}</div> : null}

      <div className={adminStyles.label} style={{ marginTop: 0 }}>
        People
      </div>
      <div className={adminStyles.card} style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className={adminStyles.search} placeholder="Name" value={personName} onChange={(e) => setPersonName(e.target.value)} />
          <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={addPerson}>
            Add
          </button>
        </div>
      </div>
      <div className={adminStyles.tableWrap} style={{ marginBottom: 24 }}>
        {!people?.length ? (
          <div className={adminStyles.empty}>No people yet.</div>
        ) : (
          people.map((p) => (
            <div key={p.id} className={adminStyles.tableRow} style={{ cursor: "default" }}>
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ opacity: 0.5, fontSize: 12, marginRight: 14 }}>{p.device_trackers.length} trackers</span>
              <button className={`${adminStyles.button} ${adminStyles.buttonDanger}`} onClick={() => removePerson(p.id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className={adminStyles.label} style={{ marginTop: 0 }}>
        Zones
      </div>
      <div className={adminStyles.card} style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className={adminStyles.search} style={{ flex: 2 }} placeholder="Name" value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
          <input className={adminStyles.search} style={{ flex: 1 }} placeholder="Latitude" value={zoneLat} onChange={(e) => setZoneLat(e.target.value)} />
          <input className={adminStyles.search} style={{ flex: 1 }} placeholder="Longitude" value={zoneLon} onChange={(e) => setZoneLon(e.target.value)} />
          <input className={adminStyles.search} style={{ flex: 1 }} placeholder="Radius (m)" value={zoneRadius} onChange={(e) => setZoneRadius(e.target.value)} />
          <button className={`${adminStyles.button} ${adminStyles.buttonPrimary}`} onClick={addZone}>
            Add
          </button>
        </div>
      </div>
      <div className={adminStyles.tableWrap}>
        {!zones?.length ? (
          <div className={adminStyles.empty}>No zones yet.</div>
        ) : (
          zones.map((z) => (
            <div key={z.id} className={adminStyles.tableRow} style={{ cursor: "default" }}>
              <span style={{ flex: 1 }}>{z.name}</span>
              <span style={{ opacity: 0.5, fontSize: 12, marginRight: 14 }}>
                {z.latitude.toFixed(4)}, {z.longitude.toFixed(4)} · {z.radius}m
              </span>
              <button className={`${adminStyles.button} ${adminStyles.buttonDanger}`} onClick={() => removeZone(z.id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
