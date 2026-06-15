import { useState } from 'react'
import { Plus, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { HubRow } from '@/lib/management'

interface CreateHubDialogProps {
    children?: React.ReactNode
    mode?: 'create' | 'edit'
    hub?: HubRow
}

export function CreateHubDialog({ children, mode = 'create', hub }: CreateHubDialogProps) {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="default">
                        <Plus className="size-4 mr-2" />
                        Create Hub
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-6 md:p-8 rounded-2xl border-none shadow-xl gap-6">
                <div className="flex flex-col items-center mb-2">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center text-foreground">
                        {mode === 'edit' ? 'Edit Hub' : 'Create New Hub'}
                    </h2>
                </div>

                <div className="flex flex-col gap-5 w-full">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Hub Name</label>
                        <Input
                            defaultValue={hub?.name || ''}
                            placeholder="e.g. Kingston Shelter A"
                            className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                            <Input
                                defaultValue={hub?.location || ''}
                                placeholder="Search Address"
                                className="h-12 rounded-lg bg-muted/50 border-none pl-10 pr-4 shadow-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Energy Source</label>
                        <Select>
                            <SelectTrigger className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none">
                                <SelectValue placeholder="Bluetti" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-md">
                                <SelectItem value="bluetti">Bluetti</SelectItem>
                                <SelectItem value="solar">Solar Panel</SelectItem>
                                <SelectItem value="grid">Grid Power</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Community</label>
                            <Select>
                                <SelectTrigger className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none">
                                    <SelectValue placeholder="Zone 3" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-md">
                                    <SelectItem value="zone1">Zone 1</SelectItem>
                                    <SelectItem value="zone2">Zone 2</SelectItem>
                                    <SelectItem value="zone3">Zone 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Connectivity</label>
                            <Select>
                                <SelectTrigger className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none">
                                    <SelectValue placeholder="Starlink" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-md">
                                    <SelectItem value="starlink">Starlink</SelectItem>
                                    <SelectItem value="cellular">Cellular</SelectItem>
                                    <SelectItem value="wifi">WiFi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full items-center justify-end">
                    <Button onClick={() => setOpen(false)} variant="outline">Cancel</Button>
                    <Button onClick={() => setOpen(false)} variant="default">
                        {mode === 'edit' ? 'Save Changes' : 'Create Hub'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
