import { Label } from "@radix-ui/react-label";
import { Plus, Trash } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "./ui/table";
import { Application } from "@/types/frontend";

interface ApplicationTabParams {
  applications: Application[] | null;
  isNewAppDialogOpen: boolean;
  newApp: {
    id: string;
    name: string;
    metadata: string;
  };
  setSelectedApp: (app: string) => void;
  setTab: (tab: string) => void;
  handleDeleteApplication: (app: string) => void;
  setIsNewAppDialogOpen: (isOpen: boolean) => void;
  setNewApp: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      metadata: string;
    }>
  >;
  handleCreateApplication: () => Promise<void>;
}

const ApplicationTab = ({
  applications,
  isNewAppDialogOpen,
  newApp,
  setSelectedApp,
  setTab,
  handleDeleteApplication,
  setIsNewAppDialogOpen,
  setNewApp,
  handleCreateApplication,
}: ApplicationTabParams) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Applications</h2>
        <Dialog open={isNewAppDialogOpen} onOpenChange={setIsNewAppDialogOpen}>
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
                        onClick={() => {
                          setSelectedApp(app.id);
                          setTab("kv");
                        }}
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
    </>
  );
};

export default ApplicationTab;
