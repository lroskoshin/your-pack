export default {
  welcome: `Welcome to Your Pack Bot 🎒
Create packs of your social accounts and track audience in one place.

<b>What you can do:</b>
🧩 Add Telegram channels/groups and Twitter profiles to a pack
🔗 Share a public URL for your pack to check stats anytime

<b>Commands:</b>
<a href="/new"> /new</a> — create a new pack
<a href="/packs"> /packs</a> — list your packs

<b>Updates:</b>
⏱️ Data is refreshed every 5 minutes. Recent changes may take a moment to appear.
`,
  language_changed: 'Language changed to {{lang}}',
  pack_created: 'Pack {{packName}} created successfully',
  pack_name_error: 'Pack name is required: {{error}}',
  no_packs:
    "You don't have any packs yet, create first one, use <a href='/new'>/new</a>",
  packs_list: 'Your packs',
  pack_info: 'Pack info',
  add_telegram: 'Add Telegram',
  edit_pack_step1:
    'Welcome to pack editor \nWhat would you like to edit in pack {{packName}}?',
  pack_not_found: 'Pack not found',
  edit_telegram: 'Edit Telegram',
  delete_telegram: 'Delete Telegram',
  add_twitter: 'Add Twitter',
  edit_twitter: 'Edit Twitter',
  delete_twitter: 'Delete Twitter',
  action_not_implemented: 'This action is not implemented yet',
  telegram_add_instructions:
    'Send me group or channel name to add it to pack, does not work with private channels',
  integration_deleted: 'Integration deleted',
  something_wrong: 'Something went wrong',
  integration_not_found: 'Integration not found',
  telegram_already_added: 'Telegram already added',
  twitter_already_added: 'Twitter already added',
  twitter_add_instructions:
    'Send me twitter profile id to add it to pack, example: elonmusk',
  twitter_add_success: 'Twitter added to pack',
  twitter_add_error: 'Twitter profile id is required',
  telegram_add_success: 'Telegram added to pack',
  telegram_add_error: 'Telegram name is required',
  edit_pack_close: 'Close',
  edit_pack_closed: 'Pack editor closed',
  error_creating_pack: 'Error creating pack {{error}}',
  check_pack_result: `<i>Pack {{packName}} check result:</i>
<b>Telegram members:</b> {{telegramMembers}}
<b>Twitter followers:</b> {{twitterFollowers}}`,
  check_pack: 'Check pack',
  delete_pack: 'Delete pack',
  copy_pack_url: 'Copy pack url',
  create_pack_instructions:
    'Send me pack name to create new pack, example: mypack',
  pack_deleted: 'Pack {{packName}} deleted successfully',
};
