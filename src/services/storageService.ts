import * as ImagePicker from 'expo-image-picker';

const SUPABASE_URL = 'https://ncpjkbfcdraqzfkyecro.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jcGprYmZjZHJhcXpma3llY3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDUzMDUsImV4cCI6MjA5MzU4MTMwNX0.9MQqESCQJQePg_pZz_FBZpvn86OAGXavpB2vMAKKhS0';

export async function escolherEFazerUploadFoto(pasta: string, id: string): Promise<string | null> {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
        console.log('Permissão da galeria negada');
        return null;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
    });

    if (resultado.canceled) return null;

    const uri = resultado.assets[0].uri;
    const nomeArquivo = `${pasta}/${id}_${Date.now()}.jpg`;

    const formData = new FormData();
    formData.append('file', {
        uri,
        name: nomeArquivo,
        type: 'image/jpeg',
    } as any);

    try {
        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/avatars/${nomeArquivo}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    'x-upsert': 'true',
                },
                body: formData,
            }
        );

        const texto = await response.text();
        console.log('UPLOAD STATUS:', response.status);
        console.log('UPLOAD RESPONSE:', texto);

        if (!response.ok) {
            return null;
        }

        return `${SUPABASE_URL}/storage/v1/object/public/avatars/${nomeArquivo}`;
    } catch (e) {
        console.log('ERRO NO UPLOAD:', e);
        return null;
    }
}