/* Create Group table */
CREATE TABLE IF NOT EXISTS `group` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255),
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `order` int(11) NOT NULL DEFAULT 0 
);


/* Create GroupItem table */
CREATE TABLE IF NOT EXISTS `group_item` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `group_id` int(11) REFERENCES `group`(`id`) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255),
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `order` int(11) NOT NULL DEFAULT 0,
  `type` varchar(255) NOT NULL DEFAULT 'file',
  `path` varchar(255),
  `url` varchar(255),
  `keybind` varchar(255)
);


ALTER TABLE `group` ADD COLUMN `type` varchar(255) NOT NULL DEFAULT 'group';