import { Label } from "@radix-ui/react-label";
import { Plus, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "./ui/table";
import { Textarea } from "./ui/textarea";
import { KVItem } from "@/hooks/useApi";

interface KVTabParams {
  kvItems: KVItem[] | null;
  selectedApp: string | null;
  isNewKVDialogOpen: boolean;
  newKV: { key: string; value: string; metadata: string };
  searchPrefix: string;
  page: number;
  itemsPerPage: number;
  setIsNewKVDialogOpen: (open: boolean) => void;
  setNewKV: React.Dispatch<
    React.SetStateAction<{
      key: string;
      value: string;
      metadata: string;
    }>
  >;
  handleCreateKVItem: () => Promise<void>;
  setSearchPrefix: (searchPrefix: string) => void;
  handleDeleteKVItem: (id: string) => void;
  setPage: (page: (prev: number) => number) => void;
}

const KVTab = ({
  kvItems,
  selectedApp,
  isNewKVDialogOpen,
  newKV,
  searchPrefix,
  page,
  itemsPerPage,
  setIsNewKVDialogOpen,
  setNewKV,
  handleCreateKVItem,
  setSearchPrefix,
  handleDeleteKVItem,
  setPage,
}: KVTabParams) => (
  <>
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">
        Key-Value Store
        {selectedApp && (
          <span className="ml-2 text-gray-500">({selectedApp})</span>
        )}
      </h2>
      <Dialog open={isNewKVDialogOpen} onOpenChange={setIsNewKVDialogOpen}>
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
  </>
);

export default KVTab;
