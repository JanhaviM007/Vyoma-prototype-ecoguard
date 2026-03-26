"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Loader2 } from "lucide-react";
import { uploadReportAction } from "@/app/actions/report-actions";

export default function ReportModal() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData) {
    setLoading(true);
    const result = await uploadReportAction(formData);
    setLoading(false);
    if (result.success) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold px-6">
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-500" /> New Vedant Report
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Category</label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GARBAGE">Garbage Dumping</SelectItem>
                <SelectItem value="WATER">Water Pollution</SelectItem>
                <SelectItem value="AIR">Air Quality Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Description</label>
            <Textarea
              name="description"
              placeholder="Describe the issue..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Upload Docs</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className="text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 font-bold"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              "Submit Report"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
