import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ResidentAPIResult } from '@/lib/api/management'

const COMMUNITIES = [
    'Savanna-la-Mar', 'Frome', 'Petersfield', 'Little London',
    'Darliston', 'Whithorn', 'Negril', 'Lucea', 'Green Island',
]

interface EditResidentDialogProps {
    children?: React.ReactNode
    resident: ResidentAPIResult
}

export function EditResidentDialog({ children, resident }: EditResidentDialogProps) {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-6 md:p-8 rounded-2xl border-none shadow-xl gap-6">
                <div className="flex flex-col items-center mb-2">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center text-foreground">Edit Resident</h2>
                </div>

                <div className="flex flex-col gap-5 w-full">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Name</label>
                        <Input
                            defaultValue={resident.full_name}
                            placeholder="e.g. John Doe"
                            className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <Input
                            defaultValue={resident.email || resident.phone_number}
                            placeholder="e.g. john@example.com"
                            className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                            type="text"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Community</label>
                            <Select defaultValue={resident.community || undefined}>
                                <SelectTrigger className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none">
                                    <SelectValue placeholder="Select Community" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-md">
                                    {COMMUNITIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Status</label>
                            <Select defaultValue={resident.is_active ? 'ACTIVE' : 'INACTIVE'}>
                                <SelectTrigger className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-md">
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="DELAYED">Delayed</SelectItem>
                                    <SelectItem value="SILENT">Silent</SelectItem>
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
