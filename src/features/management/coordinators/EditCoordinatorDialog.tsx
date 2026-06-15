import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CoordinatorRow } from '@/lib/management'

interface EditCoordinatorDialogProps {
    children?: React.ReactNode
    coordinator: CoordinatorRow
}

export function EditCoordinatorDialog({ children, coordinator }: EditCoordinatorDialogProps) {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-6 md:p-8 rounded-2xl border-none shadow-xl gap-6">
                <div className="flex flex-col items-center mb-2">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center text-foreground">Edit Coordinator</h2>
                </div>

                <div className="flex flex-col gap-5 w-full">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Name</label>
                        <Input
                            defaultValue={coordinator.name}
                            placeholder="e.g. John Doe"
                            className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <Input
                            defaultValue={coordinator.email}
                            placeholder="e.g. john@example.com"
                            className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                            type="email"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Assigned Area</label>
                            <Input
                                defaultValue={coordinator.assignedArea}
                                placeholder="e.g. Savanna-la-Mar Plaza"
                                className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Status</label>
                            <Select defaultValue={coordinator.status}>
                                <SelectTrigger className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-md">
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full items-center justify-end">
                    <Button onClick={() => setOpen(false)} variant="outline">Cancel</Button>
                    <Button onClick={() => setOpen(false)} variant="default">Save Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
