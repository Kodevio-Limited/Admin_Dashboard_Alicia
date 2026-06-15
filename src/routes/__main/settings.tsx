import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Lock, EyeOff, User, Building, Briefcase, MapPin, Mail, Edit, Loader2 } from 'lucide-react'
import JoditEditor from 'jodit-react'
import { Button } from '@/components/ui/button' 
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/sections/page-header'
import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput, InputGroupButton } from '@/components/ui/input-group'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import imgProfile3D from '@/assets/male_profile.png'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'

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
                    <Button variant="default" className="w-full" onClick={() => toast.success('Password updated successfully')}>
                        Update Password
                    </Button>
                </div>
            </div>
        </div>
    )
}

const staticContentApi = {
    get: async (key: string) => {
        await new Promise(r => setTimeout(r, 600));
        if (key === "terms-and-conditions") {
            return { content: "<p>This is the default Terms & Conditions content. You can edit this text using the rich text editor below.</p>" };
        }
        return { content: "<p>This is the default Privacy Policy content. You can edit this text using the rich text editor below.</p>" };
    },
    update: async (key: string, content: string) => {
        await new Promise(r => setTimeout(r, 800));
        return true;
    }
};

function TermsAndConditionsTab() {
    const queryClient = useQueryClient();
    const [content, setContent] = useState<string>("");
    const [isInitialized, setIsInitialized] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ["static-content", "terms-and-conditions"],
        queryFn: () => staticContentApi.get("terms-and-conditions"),
    });

    const updateContent = useMutation({
        mutationFn: () =>
            staticContentApi.update("terms-and-conditions", content),

        onSuccess: () => {
            toast.success("Terms & Conditions updated successfully");

            queryClient.invalidateQueries({
                queryKey: ["static-content", "terms-and-conditions"],
            });
        },

        onError: () => {
            toast.error("Failed to update Terms & Conditions");
        },
    });

    useEffect(() => {
        if (data) {
            setContent(data.content ?? "");
            setIsInitialized(true);
        }
    }, [data]);

    const config = useMemo(
        () => ({
            height: 512,
            readonly: false,
            buttons: [
                "bold",
                "italic",
                "underline",
                "strike",
                "subscript",
                "superscript",
                "|",
                "font",
                "fontsize",
                "paragraph",
                "|",
                "align",
                "ul",
                "ol",
                "outdent",
                "indent",
                "|",
                "table",
                "hr",
                "link",
                "|",
                "undo",
                "redo",
            ],
            placeholder: "Start typing...",
        }),
        []
    );

    if (isLoading || !isInitialized) {
        return (
            <div className="flex flex-col justify-center items-center h-96 gap-4 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" />
                <p>Loading Terms & Conditions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-destructive font-medium">
                    Error loading Terms & Conditions
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col gap-6 w-full mt-4">
            <div className="rounded-xl overflow-hidden border shadow-sm">
                <JoditEditor
                    config={config}
                    value={content}
                    onChange={(value) => setContent(value)}
                />
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <p className="text-sm font-medium text-foreground">
                    Last updated: June 8, 2026 by Dianne Plummer.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button
                        size="lg"
                        variant="secondary"
                        className="flex-1 rounded-full text-base h-12 bg-muted/50 hover:bg-muted shadow-none border"
                    >
                        Preview
                    </Button>
                    <Button
                        size="lg"
                        variant="default"
                        disabled={updateContent.isPending}
                        onClick={() => updateContent.mutate()}
                        className="flex-1 rounded-full text-base h-12 bg-[#03063A] hover:bg-[#03063A]/90 text-white shadow-none"
                    >
                        {updateContent.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
}

function PrivacyPolicyTab() {
    const queryClient = useQueryClient();
    const [content, setContent] = useState<string>("");
    const [isInitialized, setIsInitialized] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ["static-content", "privacy-policy"],
        queryFn: () => staticContentApi.get("privacy-policy"),
    });

    const updateContent = useMutation({
        mutationFn: () =>
            staticContentApi.update("privacy-policy", content),

        onSuccess: () => {
            toast.success("Privacy Policy updated successfully");

            queryClient.invalidateQueries({
                queryKey: ["static-content", "privacy-policy"],
            });
        },

        onError: () => {
            toast.error("Failed to update Privacy Policy");
        },
    });

    useEffect(() => {
        if (data) {
            setContent(data.content ?? "");
            setIsInitialized(true);
        }
    }, [data]);

    const config = useMemo(
        () => ({
            height: 512,
            readonly: false,
            buttons: [
                "bold",
                "italic",
                "underline",
                "strike",
                "subscript",
                "superscript",
                "|",
                "font",
                "fontsize",
                "paragraph",
                "|",
                "align",
                "ul",
                "ol",
                "outdent",
                "indent",
                "|",
                "table",
                "hr",
                "link",
                "|",
                "undo",
                "redo",
            ],
            placeholder: "Start typing...",
        }),
        []
    );

    if (isLoading || !isInitialized) {
        return (
            <div className="flex flex-col justify-center items-center h-96 gap-4 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" />
                <p>Loading Privacy Policy...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-destructive font-medium">
                    Error loading Privacy Policy
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col gap-6 w-full mt-4">
            <div className="rounded-xl overflow-hidden border shadow-sm">
                <JoditEditor
                    config={config}
                    value={content}
                    onChange={(value) => setContent(value)}
                />
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <p className="text-sm font-medium text-foreground">
                    Last updated: June 8, 2026 by Dianne Plummer.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button
                        size="lg"
                        variant="secondary"
                        className="flex-1 rounded-full text-base h-12 bg-muted/50 hover:bg-muted shadow-none border"
                    >
                        Preview
                    </Button>
                    <Button
                        size="lg"
                        variant="default"
                        disabled={updateContent.isPending}
                        onClick={() => updateContent.mutate()}
                        className="flex-1 rounded-full text-base h-12 bg-[#03063A] hover:bg-[#03063A]/90 text-white shadow-none"
                    >
                        {updateContent.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
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
                        <Button variant="default" className="w-full" onClick={() => toast.success('Profile changes saved')}>
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
                            onClick={() => toast.success('Notifications settings Updated')}
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
                <TabsList className="inline-flex w-fit h-10 md:h-12 bg-[#DFDFDF] p-1.5 rounded-full overflow-x-auto justify-start border-0">
                    <TabsTrigger value="profile" className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#03063A] data-[state=active]:shadow-sm text-[#737373] transition-all">
                        My Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#03063A] data-[state=active]:shadow-sm text-[#737373] transition-all">
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="privacy-policy" className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#03063A] data-[state=active]:shadow-sm text-[#737373] transition-all">
                        Privacy Policy
                    </TabsTrigger>
                    <TabsTrigger value="terms-and-conditions" className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#03063A] data-[state=active]:shadow-sm text-[#737373] transition-all">
                        Terms & Conditions
                    </TabsTrigger>
                </TabsList>

                <div className="mt-2 flex-1 bg-white rounded-[12px] p-6 md:p-10 flex flex-col shadow-sm min-h-0 overflow-y-auto">
                    <TabsContent value="profile" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <ProfileTab />
                    </TabsContent>
                    <TabsContent value="security" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <SecurityTab />
                    </TabsContent>
                    <TabsContent value="privacy-policy" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <PrivacyPolicyTab />
                    </TabsContent>
                    <TabsContent value="terms-and-conditions" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col">
                        <TermsAndConditionsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </>
    )
}
