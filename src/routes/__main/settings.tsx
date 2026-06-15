import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Lock, EyeOff, User, Building, Briefcase, MapPin, Mail, ShieldCheck, Smartphone, MailCheck, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/sections/page-header'
import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput, InputGroupButton } from '@/components/ui/input-group'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import imgProfile3D from '@/assets/male_profile.png'

export const Route = createFileRoute('/__main/settings')({
    component: SettingsPage,
})
interface PasswordFieldProps {
    label: string
}

function PasswordField({ label }: PasswordFieldProps) {
    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <InputGroup className="rounded-full bg-muted/50 border-transparent focus-within:ring-primary/20">
                <InputGroupAddon align="inline-start">
                    <InputGroupText>
                        <Lock className="size-5" />
                    </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput type="password" placeholder="••••••••" />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground hover:bg-transparent">
                        <EyeOff className="size-5" />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </Field>
    )
}

function SecurityTab() {
    return (
        <div className="flex flex-col items-center gap-4 w-full pb-4 flex-1">
            <div className="flex flex-col gap-4 w-full max-w-2xl mt-8">
                <PasswordField label="Current Password" />
                <PasswordField label="New Password" />
                <PasswordField label="Confirm Password" />
                <div className="mt-8">
                    <Button size="lg" className="w-full" onClick={() => toast.success('Password updated successfully')}>
                        Update Password
                    </Button>
                </div>
            </div>
        </div>
    )
}

function TwoFactorTab() {
    return (
        <div className="flex flex-col items-center gap-4 w-full pb-4 flex-1">
            <div className="flex flex-col gap-6 w-full max-w-2xl mt-8">
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-lg md:text-xl">Two-Factor Authentication</h3>
                    <p className="text-muted-foreground text-base">Protect your account with an extra layer of security.</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[12px] bg-muted/30 border">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="size-8 text-[#0a9105]" />
                            <p className="font-semibold text-md">Status</p>
                        </div>
                        <Badge variant="success" className="w-fit">Enabled</Badge>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-primary scale-125 origin-right" />
                </div>

                <div className="flex flex-col gap-4 mt-2">
                    <p className="font-medium text-lg text-foreground">Authentication Method</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 p-4 rounded-[12px] border-2 border-primary bg-primary/5 cursor-pointer transition-colors">
                            <div className="size-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-primary/20 text-primary">
                                <Smartphone className="size-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="font-medium text-primary text-lg">Authenticator App</p>
                                <p className="text-muted-foreground text-sm">Google Auth, Authy etc</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-[12px] border-2 border-transparent bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                            <div className="size-12 rounded-full bg-white flex items-center justify-center shrink-0 border text-muted-foreground">
                                <MailCheck className="size-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="font-medium text-foreground text-lg">Email OTP</p>
                                <p className="text-muted-foreground text-sm">Codes sent to inbox</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button size="lg" className="w-full" onClick={() => toast.success('2FA settings saved')}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface FormInputProps {
    label: string
    icon: React.ElementType
    defaultValue: string
}

function FormInput({ label, icon: Icon, defaultValue }: FormInputProps) {
    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <InputGroup className="rounded-full bg-muted/50 border-transparent focus-within:ring-primary/20">
                <InputGroupAddon align="inline-start">
                    <InputGroupText>
                        <Icon className="size-5" />
                    </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput type="text" defaultValue={defaultValue} className="font-medium" />
            </InputGroup>
        </Field>
    )
}

function ProfileTab() {
    return (
        <div className="w-full flex flex-col items-center flex-1">
            <div className="flex flex-col items-center gap-8 md:gap-10 w-full mt-4">
                {/* Avatar */}
                <div className="flex justify-center relative">
                    <div className="relative group cursor-pointer">
                        <Avatar className="size-32 md:size-36 ring-4 ring-white shadow-sm">
                            <AvatarImage src={imgProfile3D} alt="Profile Picture" className="group-hover:scale-105 transition-transform duration-500 object-cover" />
                            <AvatarFallback>DP</AvatarFallback>
                        </Avatar>
                        {/* Edit button */}
                        <div className="absolute bottom-0 right-0 bg-[#545c99] text-white size-10 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform">
                            <Edit className="size-4" />
                        </div>
                    </div>
                </div>

                {/* Form rows */}
                <div className="flex flex-col gap-6 w-full max-w-4xl">
                    {/* Row 1: Full Name + Organization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                        <FormInput label="Full Name" defaultValue="David Plummer" icon={User} />
                        <FormInput label="Organization" defaultValue="Stem Spark Solutions" icon={Building} />
                    </div>

                    {/* Row 2: Role + Licensed Territory */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                        <FormInput label="Role" defaultValue="System Administrator" icon={Briefcase} />
                        <FormInput label="Licensed Territory" defaultValue="Jamaica" icon={MapPin} />
                    </div>

                    {/* Email */}
                    <div className="w-full">
                        <FormInput label="Email" defaultValue="hello@stemsparksolutions.com" icon={Mail} />
                    </div>

                    {/* Save Button */}
                    <div className="mt-4 w-full">
                        <Button size="lg" className="w-full" onClick={() => toast.success('Profile changes saved')}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

type NotifRow = {
    key: string
    title: string
    description: string
    defaultOn: boolean
}

const notifRows = [
    {
        key: 'silence',
        title: 'Silence Alerts',
        description: 'Temporarily mute all non-critical push and email notifications.',
        defaultOn: false,
    },
    {
        key: 'medical',
        title: 'Urgent Medical Flags',
        description: 'Receive immediate alerts when AI detects potential medical emergencies.',
        defaultOn: true,
    },
    {
        key: 'battery',
        title: 'Hub Battery Critical',
        description: 'Get notified when any infrastructure hub drops below 20% battery capacity.',
        defaultOn: true,
    },
    {
        key: 'report',
        title: 'New AI Situation Report Available',
        description: 'Be alerted the moment a new scheduled or ad-hoc AI report is generated.',
        defaultOn: true,
    },
] satisfies Array<NotifRow>

function NotificationsTab() {
    const [toggles, setToggles] = useState<{ [key: string]: boolean }>(Object.fromEntries(notifRows.map((r) => [r.key, r.defaultOn])))

    return (
        <div className="w-full flex justify-center flex-1">
            <div className="flex flex-col gap-8 w-full max-w-4xl mt-8">
                {notifRows.map((row) => (
                    <div key={row.key} className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                        <div className="flex flex-col gap-1.5 flex-1 pr-8">
                            <p className="font-semibold text-lg text-foreground">{row.title}</p>
                            <p className="text-muted-foreground text-sm leading-relaxed">{row.description}</p>
                        </div>
                        <Switch
                            checked={toggles[row.key]}
                            onCheckedChange={(v) => setToggles((prev) => ({ ...prev, [row.key]: v }))}
                            className="data-[state=checked]:bg-primary scale-125"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

function SettingsPage() {
    return (
        <>
            <PageHeader title="Settings" description="Manage your account & apps." lastUpdated="05:41:15 PM" />

            <Tabs defaultValue="profile" className="flex-1 flex flex-col w-full min-h-0">
                <TabsList className="inline-flex w-fit h-10 md:h-12 bg-muted/50 p-1.5 rounded-full overflow-x-auto justify-start border-0">
                    <TabsTrigger value="profile" className="rounded-full px-6 h-full text-sm font-medium">
                        My Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-full px-6 h-full text-sm font-medium">
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="2fa" className="rounded-full px-6 h-full text-sm font-medium">
                        Two-Factor Auth
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-full px-6 h-full text-sm font-medium">
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <div className="mt-2 flex-1 bg-white rounded-[12px] p-6 md:p-10 flex flex-col shadow-sm min-h-0 overflow-y-auto">
                    <TabsContent value="profile" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <ProfileTab />
                    </TabsContent>
                    <TabsContent value="security" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <SecurityTab />
                    </TabsContent>
                    <TabsContent value="2fa" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <TwoFactorTab />
                    </TabsContent>
                    <TabsContent value="notifications" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <NotificationsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </>
    )
}
