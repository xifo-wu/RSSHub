import got from '@/utils/got';

export async function doGot(link: string) {
    const response = await got.get(link);

    return response.data;
}

export function formatFileSize(bytes: number) {
    if (bytes < 1024) {return bytes + ' B';}
    const units = ['KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (bytes >= 1024) {
        bytes /= 1024;
        i++;
    }
    return bytes.toFixed(2) + ' ' + units[i - 1];
}
