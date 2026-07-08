import { client } from '../api-client'

export async function uploadImage(file: File, folder?: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const path = folder ? `/upload/image?folder=${encodeURIComponent(folder)}` : '/upload/image'

    const response = await client<{ url: string }>(path, {
        method: 'POST',
        data: formData,
    })
    return response.url
}

export async function deleteImage(url: string): Promise<void> {
    await client(`/upload/image?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
    })
}
