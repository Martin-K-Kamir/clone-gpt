export function isSupabaseStorageUrl(url: string | undefined | null): boolean {
    if (!url) {
        return false;
    }

    try {
        return /\.supabase\.co\/storage\/v1\/object\/public\//.test(url);
    } catch {
        return false;
    }
}
