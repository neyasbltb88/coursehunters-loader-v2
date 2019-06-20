import Utils from './utils';

export default class Collectors {
    static async collectLessonsData(lesson_elems, storage) {
        let result_items = [];

        lesson_elems.forEach((elem, index) => {
            let item = {};
            let restore_item_loaded = storage.get(index);

            item.index = index;
            item.name_prefix = elem.querySelector('[itemprop="name"]').textContent;
            item.lesson_name = elem.querySelector('.lessons-name').textContent;
            item.url = elem.querySelector('[itemprop="url"]').href;
            item.ext = Utils.UrlParse(item.url).file.ext;
            item.content = null;
            item.mime = null;
            item.total = restore_item_loaded ? +restore_item_loaded : 0;
            item.loaded = restore_item_loaded ? +restore_item_loaded : 0;
            item.percent = restore_item_loaded ? 100 : 0;
            item.is_checked = true;
            item.is_loading = false;
            item.is_loaded = restore_item_loaded ? true : false;

            item.was_loaded = restore_item_loaded ? true : false;

            result_items.push(item);
        });

        return result_items;
    }
}