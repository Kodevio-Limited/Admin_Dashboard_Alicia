import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from '@/components/ui/input-group'

interface FormInputProps {
    label: string
    icon: React.ElementType
    defaultValue?: string
    name?: string
    disabled?: boolean
    type?: string
}

export function FormInput({ label, icon: Icon, defaultValue, name, disabled, type = 'text' }: FormInputProps) {
    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <InputGroup
                className={`rounded-full bg-muted/50 border-transparent focus-within:ring-primary/20 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}
            >
                <InputGroupAddon align="inline-start">
                    <InputGroupText>
                        <Icon className="size-5" />
                    </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput type={type} name={name} defaultValue={defaultValue} disabled={disabled} className="font-medium" />
            </InputGroup>
        </Field>
    )
}
