import Utils from './utils';

export default class Collectors {
    static async collectLessonsData(storage) {
        let lesson_elems = document.querySelectorAll('.lessons-item');
        let result_items = [];

        lesson_elems.forEach((elem, index) => {
            let item = {};
            let restore_item_loaded = storage.get(index);

            item.index = index;
            item.name_prefix = elem.querySelector('[itemprop="name"]').textContent;
            item.lesson_name = elem.querySelector('.lessons-name').textContent;
            item.storage_name = index;
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

    static async collectMaterials(storage, index, course_name) {
        let materials_btn = document.querySelector('[title="Download course materials"]');
        if (!materials_btn) return false;

        let restore_material_item = storage.get('code');
        let material_item = {};


        material_item.index = index;
        material_item.name_prefix = 'Материалы курса';
        material_item.name_concat = ' - ';
        material_item.lesson_name = course_name;
        material_item.storage_name = 'code';
        material_item.url = materials_btn.href;
        material_item.ext = Utils.UrlParse(material_item.url).file.ext;
        material_item.content = null;
        material_item.mime = null;
        material_item.total = restore_material_item ? +restore_material_item : 0;
        material_item.loaded = restore_material_item ? +restore_material_item : 0;
        material_item.percent = restore_material_item ? 100 : 0;
        material_item.is_checked = true;
        material_item.is_loading = false;
        material_item.is_loaded = restore_material_item ? true : false;

        material_item.was_loaded = restore_material_item ? true : false;

        return material_item;
    }
}