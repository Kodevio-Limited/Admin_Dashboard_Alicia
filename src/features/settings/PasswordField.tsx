import { useState } from 'react'
import { Lock, EyeOff, Eye } from 'lucide-react'
import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput, InputGroupButton } from '@/components/ui/input-group'

interface PasswordFieldProps {
    label: string
    value: string
    onChange: (val: string) => void
    placeholder?: string
}

export function PasswordField({ label, value, onChange, placeholder = '••••••••' }: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <InputGroup className="rounded-full bg-muted/50 border-transparent focus-within:ring-primary/20">
                <InputGroupAddon align="inline-start">
                    <InputGroupText>
                        <Lock className="size-5" />
                    </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                    type={showPassword ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </Field>
    )
}
