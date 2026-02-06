"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { layoutStorage } from "@/lib/layoutStorage";
import { VenueLayout } from "@/types/layout";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Copy,
  Trash2,
  Edit3,
  Eye,
  MapPin,
  Users,
  Calendar,
  ArrowLeft,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function LayoutsPage() {
  const router = useRouter();
  const [layouts, setLayouts] = useState<VenueLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = layoutStorage.onLayoutsChange((fetched) => {
      setLayouts(fetched.filter((l) => !l.isTemplate));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredLayouts = layouts.filter((layout) => {
    const matchesSearch =
      layout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      layout.venueName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" || layout.templateCategory === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalCapacity = layouts.reduce((sum, l) => sum + l.totalCapacity, 0);
  const mostUsed = layouts.sort((a, b) => b.usageCount - a.usageCount)[0];

  const handleDuplicate = async (id: string) => {
    try {
      await layoutStorage.duplicateLayout(id);
    } catch (error) {
      console.error("Error duplicating layout:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await layoutStorage.deleteLayout(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting layout:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "archived":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Venue Layouts
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Create and manage venue seating layouts
              </p>
            </div>
          </div>
          <Button onClick={() => router.push("/admin/layouts/builder/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Layout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {layouts.length}
                  </p>
                  <p className="text-xs text-gray-500">Total Layouts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalCapacity.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 truncate max-w-[150px]">
                    {mostUsed?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">Most Used Layout</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {layouts.filter((l) => l.status === "active").length}
                  </p>
                  <p className="text-xs text-gray-500">Active Layouts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search layouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="all">All Types</option>
              <option value="theater">Theater</option>
              <option value="stadium">Stadium</option>
              <option value="conference">Conference</option>
              <option value="concert">Concert</option>
              <option value="banquet">Banquet</option>
              <option value="cinema">Cinema</option>
            </select>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-gold-500 text-black" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-gold-500 text-black" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Layouts Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLayouts.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <Layers className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchQuery ? "No layouts found" : "No layouts yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first venue layout to get started"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push("/admin/layouts/builder/new")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Layout
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLayouts.map((layout) => (
              <Card
                key={layout.id}
                className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Preview area */}
                <div className="h-40 bg-gray-100 rounded-t-lg relative overflow-hidden flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 mx-auto text-gray-300" />
                    <p className="text-xs text-gray-400 mt-2">
                      {layout.totalCapacity} seats
                    </p>
                  </div>
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/layouts/builder/${layout.id}`)
                      }
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDuplicate(layout.id)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {layout.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {layout.venueName || "No venue"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(layout.status)}`}
                    >
                      {layout.status.charAt(0).toUpperCase() +
                        layout.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
                    <span>{layout.priceZones.length} zones</span>
                    <span>
                      Used {layout.usageCount}{" "}
                      {layout.usageCount === 1 ? "time" : "times"}
                    </span>
                    <span>
                      {new Date(layout.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-xs"
                      onClick={() =>
                        router.push(`/admin/layouts/builder/${layout.id}`)
                      }
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-xs"
                      onClick={() => handleDuplicate(layout.id)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Duplicate
                    </Button>
                    {deleteConfirmId === layout.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs"
                          onClick={() => handleDelete(layout.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-red-500 hover:text-red-700"
                        onClick={() => setDeleteConfirmId(layout.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Venue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Capacity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Zones
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Updated
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLayouts.map((layout) => (
                    <tr
                      key={layout.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {layout.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {layout.venueName || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {layout.totalCapacity}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {layout.priceZones.slice(0, 4).map((zone) => (
                            <div
                              key={zone.id}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: zone.colorHex }}
                              title={zone.zoneName}
                            />
                          ))}
                          {layout.priceZones.length > 4 && (
                            <span className="text-xs text-gray-400">
                              +{layout.priceZones.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(layout.status)}`}
                        >
                          {layout.status.charAt(0).toUpperCase() +
                            layout.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(layout.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              router.push(
                                `/admin/layouts/builder/${layout.id}`
                              )
                            }
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicate(layout.id)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() =>
                              deleteConfirmId === layout.id
                                ? handleDelete(layout.id)
                                : setDeleteConfirmId(layout.id)
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
