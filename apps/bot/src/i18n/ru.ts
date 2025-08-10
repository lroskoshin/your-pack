export default {
  welcome: `Добро пожаловать в Your Pack Bot 🎒
Создавайте паки из ваших соц. аккаунтов и следите за аудиторией в одном месте.

<b>Что можно делать:</b>
🧩 Добавлять каналы/группы Telegram и профили Twitter в пак
🔗 Получать публичную ссылку на пак и смотреть статистику

<b>Команды:</b>
<code>/new</code> — создать новый пак
<code>/packs</code> — список ваших паков

<b>Обновление данных:</b>
⏱️ Данные обновляются каждые 5 минут. Недавние изменения могут появиться с задержкой.
`,
  language_changed: 'Язык изменен на {{lang}}',
  pack_created: 'Pack {{packName}} создан успешно',
  pack_name_error: "Название pack'а обязательно: {{error}}",
  no_packs:
    "У вас пока нет pack'ов, создайте первый, используя <a href='/new'>/new</a>",
  packs_list: "Ваши pack'и",
  pack_info: 'Информация о pack',
  add_telegram: 'Добавить Telegram',
  edit_pack_step1:
    'Добро пожаловать в редактор pack \nЧто бы вы хотели изменить в pack {{packName}}?',
  pack_not_found: 'Pack не найден',
  edit_telegram: 'Редактировать Telegram',
  delete_telegram: 'Удалить Telegram',
  add_twitter: 'Добавить Twitter',
  edit_twitter: 'Редактировать Twitter',
  delete_twitter: 'Удалить Twitter',
  action_not_implemented: 'Действие пока не реализовано',
  telegram_add_instructions:
    'Отправьте мне название группы или канала, чтобы добавить его в pack, не работает с приватными каналами',
  integration_deleted: 'Интеграция удалена',
  something_wrong: 'Что-то пошло не так',
  integration_not_found: 'Интеграция не найдена',
  telegram_already_added: 'Telegram уже добавлен',
  twitter_already_added: 'Twitter уже добавлен',
  twitter_add_instructions:
    'Отправьте мне twitter profile id, чтобы добавить его в pack, пример: elonmusk',
  edit_pack_close: 'Закрыть',
  edit_pack_closed: 'Редактор pack закрыт',
  error_creating_pack: 'Ошибка создания pack: {{error}}',
  check_pack_result: `<i>Результат проверки pack {{packName}}:</i>
<b>Члены Telegram:</b> {{telegramMembers}}
<b>Подписчики Twitter:</b> {{twitterFollowers}}`,
  check_pack: 'Проверить pack',
  delete_pack: 'Удалить pack',
  copy_pack_url: 'Скопировать ссылку на pack',
  create_pack_instructions:
    'Отправьте мне название pack, чтобы создать новый, пример: mypack',
  pack_deleted: 'Pack {{packName}} удален успешно',
};
