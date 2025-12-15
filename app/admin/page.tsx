"use client"

import { useSession } from "next-auth/react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserMenu } from "@/components/user-menu"
import { BeamsBackground } from "@/components/opensource/bg-beams"
import { Trash2, Edit2, Save, X } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const { data: session, status } = useSession()
  // @ts-ignore - session.user.id is added by NextAuth callback
  const userId = session?.user?.id

  const isAdmin = useQuery(
    api.users.checkIsAdmin,
    userId ? { userId } : "skip"
  )

  const staffPicks = useQuery(
    api.admin.getStaffPicks,
    userId && isAdmin ? { userId } : "skip"
  )

  const addStaffPick = useMutation(api.admin.addStaffPick)
  const updateStaffPick = useMutation(api.admin.updateStaffPick)
  const removeStaffPick = useMutation(api.admin.removeStaffPick)

  const [newPick, setNewPick] = useState({
    repoId: "",
    reason: "",
    order: "0",
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ reason: string; order: number } | null>(null)

  if (status === "loading") {
    return (
      <div className="relative min-h-screen w-full text-white" style={{ backgroundColor: "#121212" }}>
        <BeamsBackground className="fixed inset-0 -z-10" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="relative min-h-screen w-full text-white" style={{ backgroundColor: "#121212" }}>
        <BeamsBackground className="fixed inset-0 -z-10" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Authentication Required</h1>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isAdmin === undefined) {
    return (
      <div className="relative min-h-screen w-full text-white" style={{ backgroundColor: "#121212" }}>
        <BeamsBackground className="fixed inset-0 -z-10" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen w-full text-white" style={{ backgroundColor: "#121212" }}>
        <BeamsBackground className="fixed inset-0 -z-10" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-4">You do not have admin privileges.</p>
            <Link href="/opensource">
              <Button variant="outline">Go to Open Source</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleAddStaffPick = async () => {
    if (!userId || !newPick.repoId || !newPick.reason) {
      alert("Please fill in all fields")
      return
    }

    try {
      await addStaffPick({
        userId,
        repoId: parseInt(newPick.repoId, 10),
        reason: newPick.reason,
        order: parseInt(newPick.order, 10),
      })
      setNewPick({ repoId: "", reason: "", order: "0" })
    } catch (error: any) {
      alert(`Error: ${error.message || "Failed to add staff pick"}`)
    }
  }

  const handleStartEdit = (staffPick: any) => {
    setEditingId(staffPick._id)
    setEditValues({
      reason: staffPick.reason,
      order: staffPick.order,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues(null)
  }

  const handleSaveEdit = async (staffPickId: string) => {
    if (!userId || !editValues) return

    try {
      await updateStaffPick({
        userId,
        staffPickId: staffPickId as any,
        reason: editValues.reason,
        order: editValues.order,
      })
      setEditingId(null)
      setEditValues(null)
    } catch (error: any) {
      alert(`Error: ${error.message || "Failed to update staff pick"}`)
    }
  }

  const handleDelete = async (staffPickId: string) => {
    if (!userId) return
    if (!confirm("Are you sure you want to remove this staff pick?")) return

    try {
      await removeStaffPick({
        userId,
        staffPickId: staffPickId as any,
      })
    } catch (error: any) {
      alert(`Error: ${error.message || "Failed to remove staff pick"}`)
    }
  }

  return (
    <div className="relative min-h-screen w-full text-white" style={{ backgroundColor: "#121212" }}>
      <BeamsBackground className="fixed inset-0 -z-10" />

      <div className="sticky top-0 z-30 backdrop-blur-lg border-b border-white/10" style={{ backgroundColor: "rgba(18, 18, 18, 0.8)" }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/opensource">
                <h1 className="text-xl font-semibold text-white cursor-pointer hover:opacity-80">reposs</h1>
              </Link>
              <span className="text-gray-400">/</span>
              <h2 className="text-lg font-medium text-white">Admin Panel</h2>
            </div>
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Staff Picks Management</h1>
          <p className="text-gray-400">Manage repositories featured on the Staff Picked section</p>
        </div>

        <Card className="mb-6 border-white/10 bg-[#1a1a1a]">
          <CardHeader>
            <CardTitle>Add New Staff Pick</CardTitle>
            <CardDescription>Add a repository to the staff picks list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Repository ID (GitHub)</label>
              <Input
                type="number"
                placeholder="e.g., 123456789"
                value={newPick.repoId}
                onChange={(e) => setNewPick({ ...newPick, repoId: e.target.value })}
                className="border-white/10 bg-[#0a0a0a] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <Input
                placeholder="Why is this repository featured?"
                value={newPick.reason}
                onChange={(e) => setNewPick({ ...newPick, reason: e.target.value })}
                className="border-white/10 bg-[#0a0a0a] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Order/Weight (lower = higher priority)</label>
              <Input
                type="number"
                placeholder="0"
                value={newPick.order}
                onChange={(e) => setNewPick({ ...newPick, order: e.target.value })}
                className="border-white/10 bg-[#0a0a0a] text-white"
              />
            </div>
            <Button onClick={handleAddStaffPick} className="w-full">
              Add Staff Pick
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#1a1a1a]">
          <CardHeader>
            <CardTitle>Current Staff Picks</CardTitle>
            <CardDescription>
              {staffPicks === undefined
                ? "Loading..."
                : staffPicks.length === 0
                  ? "No staff picks yet"
                  : `${staffPicks.length} staff pick${staffPicks.length === 1 ? "" : "s"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {staffPicks === undefined ? (
              <div className="text-gray-400">Loading...</div>
            ) : staffPicks.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No staff picks have been added yet.</div>
            ) : (
              <div className="space-y-4">
                {staffPicks.map((pick: any) => (
                  <div
                    key={pick._id}
                    className="p-4 border border-white/10 rounded-lg bg-[#0a0a0a]"
                  >
                    {editingId === pick._id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">Repository ID</label>
                          <div className="text-gray-400">{pick.repoId}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Reason</label>
                          <Input
                            value={editValues?.reason || ""}
                            onChange={(e) =>
                              setEditValues({ ...editValues!, reason: e.target.value })
                            }
                            className="border-white/10 bg-[#1a1a1a] text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Order</label>
                          <Input
                            type="number"
                            value={editValues?.order ?? 0}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues!,
                                order: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="border-white/10 bg-[#1a1a1a] text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(pick._id)}
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">Repo ID: {pick.repoId}</span>
                            <span className="text-xs text-gray-400">(Order: {pick.order})</span>
                          </div>
                          <p className="text-gray-300">{pick.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEdit(pick)}
                            className="flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(pick._id)}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
