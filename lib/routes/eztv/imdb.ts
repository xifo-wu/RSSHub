import dayjs from 'dayjs';
import { doGot, formatFileSize } from './util';
import { Route } from '@/types';

export const route: Route = {
    path: '/imdb/:imdb',
    categories: ['multimedia'],
    example: '/eztv/imdb/11126994',
    parameters: { imdb: 'Imdb ID 不带 tt的纯数字' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['eztvx.to'],
        },
    ],
    name: '影视资源下载列表',
    maintainers: ['miemieYaho'],
    handler,
};

async function handler(ctx: any) {
    const imdb = ctx.req.param('imdb');

    let page = 1;
    const limit = 100;
    const host = `https://eztv.it`;
    const _link = `${host}/api/get-torrents?imdb_id=${imdb}&limit=${limit}`;

    const response = await doGot(`${_link}&page=${page}`);

    // 判断是否需要下一页
    const torrentsCount = response.torrents_count;
    let torrents = response.torrents;
    const torrentsLen = torrents.length;

    while (true) {
        if (torrentsLen === torrentsCount) {
            break;
        }
        // 少请求点
        if (torrentsLen > 300) {
            break;
        }

        page += 1;

        // eslint-disable-next-line no-await-in-loop
        const response = await doGot(`${_link}&page=${page}`);
        const newTorrents = response.torrents || [];
        torrents = [...torrents, ...newTorrents];

        if (torrents.length === torrentsCount || newTorrents.length === 0) {
            break;
        }
    }

    const items = (torrents || []).map((item: any) => {
        const fileSize = formatFileSize(Number(item.size_bytes));

        return {
            title: item.title,
            guid: item.filename,
            description: `${item.filename}[${fileSize}]`,
            link: item.torrent_url,
            pubDate: dayjs.unix(item.date_released_unix).format('YYYY-MM-DD HH:mm:ss'),
            enclosure_type: 'application/x-bittorrent',
            enclosure_url: item.torrent_url,
            enclosure_length: fileSize,
        };
    });

    return {
        title: `EZTV API IMDB - ${imdb} - 共 ${items.length} 条记录`,
        link: _link,
        item: items,
    };
}
