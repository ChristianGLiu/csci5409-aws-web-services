create database if not exists `csci5409`;

USE `csci5409`;

SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `part` (

  `part_no` int(11) NOT NULL,
  `part_desc` varchar(250)  NOT NULL default '',
   PRIMARY KEY  (`part_no`)

);

INSERT INTO `part` SET `part_no` = 0, `part_desc` = `engine`;
INSERT INTO `part` SET `part_no` = 1, `part_desc` = `windshield`;
INSERT INTO `part` SET `part_no` = 2, `part_desc` = `wheel`;
INSERT INTO `part` SET `part_no` = 3, `part_desc` = `gps`;
INSERT INTO `part` SET `part_no` = 4, `part_desc` = `radio`;
commit;