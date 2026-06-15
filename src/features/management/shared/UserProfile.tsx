import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserProfileProps {
    name: string
    email: string
    avatar: string
}

export function UserProfile({ name, email, avatar }: UserProfileProps) {
    return (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>{name}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
            </div>
        </div>
    )
}
