import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Plus, Trash } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApplications, useKVStore } from "@/hooks/useApi";

const itemsPerPage = 10;

const AdminUI = () => {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchPrefix, setSearchPrefix] = useState("");
  const [isNewAppDialogOpen, setIsNewAppDialogOpen] = useState(false);
  const [isNewKVDialogOpen, setIsNewKVDialogOpen] = useState(false);
  const [newApp, setNewApp] = useState({ id: "", name: "", metadata: "" });
  const [newKV, setNewKV] = useState({ key: "", value: "", metadata: "" });

  const {
    data: applications,
    error: appError,
    fetchApplications,
    createApplication,
    deleteApplication,
  } = useApplications();

  const {
    data: kvItems,
    error: kvError,
    fetchKVItems,
    createKVItem,
    deleteKVItem,
  } = useKVStore();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (selectedApp) {
      fetchKVItems(selectedApp, searchPrefix);
    }
  }, [selectedApp, searchPrefix, fetchKVItems]);

  const handleCreateApplication = async () => {
    try {
      const success = await createApplication({
        id: newApp.id,
        name: newApp.name,
        metadata: newApp.metadata ? JSON.parse(newApp.metadata) : {},
      });

      if (success) {
        setIsNewAppDialogOpen(false);
        setNewApp({ id: "", name: "", metadata: "" });
      }
    } catch (err) {
      console.error("Failed to create application:", err);
    }
  };

  const handleCreateKVItem = async () => {
    if (!selectedApp) return;
    try {
      const success = await createKVItem(
        selectedApp,
        newKV.key,
        JSON.parse(newKV.value),
        newKV.metadata ? JSON.parse(newKV.metadata) : undefined
      );

      if (success) {
        setIsNewKVDialogOpen(false);
        setNewKV({ key: "", value: "", metadata: "" });
      }
    } catch (err) {
      console.error("Failed to create KV item:", err);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    const success = await deleteApplication(id);
    if (success && selectedApp === id) {
      setSelectedApp(null);
    }
  };

  const handleDeleteKVItem = async (key: string) => {
    if (
      !selectedApp ||
      !confirm("Are you sure you want to delete this KV item?")
    )
      return;
    await deleteKVItem(selectedApp, key);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">TinyCore Admin</h1>

      {(appError || kvError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{appError || kvError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="kv">Key-Value Store</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Applications</h2>
            <Dialog
              open={isNewAppDialogOpen}
              onOpenChange={setIsNewAppDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Application</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Application ID</Label>
                    <Input
                      value={newApp.id}
                      onChange={(e) =>
                        setNewApp((prev) => ({ ...prev, id: e.target.value }))
                      }
                      placeholder="my-app"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={newApp.name}
                      onChange={(e) =>
                        setNewApp((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="My Application"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Metadata (JSON)</Label>
                    <Textarea
                      value={newApp.metadata}
                      onChange={(e) =>
                        setNewApp((prev) => ({
                          ...prev,
                          metadata: e.target.value,
                        }))
                      }
                      placeholder='{"environment": "development"}'
                    />
                  </div>
                  <Button onClick={handleCreateApplication}>
                    Create Application
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.id}</TableCell>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>
                        {new Date(app.created_at!).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApp(app.id)}
                          >
                            View KV Store
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteApplication(app.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kv" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Key-Value Store
              {selectedApp && (
                <span className="ml-2 text-gray-500">({selectedApp})</span>
              )}
            </h2>
            <Dialog
              open={isNewKVDialogOpen}
              onOpenChange={setIsNewKVDialogOpen}
            >
              <DialogTrigger asChild>
                <Button disabled={!selectedApp}>
                  <Plus className="mr-2 h-4 w-4" />
                  New KV Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New KV Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Key</Label>
                    <Input
                      value={newKV.key}
                      onChange={(e) =>
                        setNewKV((prev) => ({ ...prev, key: e.target.value }))
                      }
                      placeholder="my-key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Value (JSON)</Label>
                    <Textarea
                      value={newKV.value}
                      onChange={(e) =>
                        setNewKV((prev) => ({ ...prev, value: e.target.value }))
                      }
                      placeholder='{"data": "value"}'
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Metadata (JSON)</Label>
                    <Textarea
                      value={newKV.metadata}
                      onChange={(e) =>
                        setNewKV((prev) => ({
                          ...prev,
                          metadata: e.target.value,
                        }))
                      }
                      placeholder='{"type": "config"}'
                    />
                  </div>
                  <Button onClick={handleCreateKVItem}>Create KV Item</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {selectedApp ? (
            <>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search by prefix..."
                    value={searchPrefix}
                    onChange={(e) => setSearchPrefix(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kvItems
                        ?.slice((page - 1) * itemsPerPage, page * itemsPerPage)
                        .map((item) => (
                          <TableRow key={item.key}>
                            <TableCell>{item.key}</TableCell>
                            <TableCell>
                              <pre className="text-sm">
                                {JSON.stringify(item.value, null, 2)}
                              </pre>
                            </TableCell>
                            <TableCell>
                              {new Date(item.updated_at!).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteKVItem(item.key)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <div>
                  Showing {Math.min(kvItems?.length || 0, itemsPerPage)} of{" "}
                  {kvItems?.length || 0} items
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * itemsPerPage >= (kvItems?.length || 0)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Select an application to view its KV store
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUI;
