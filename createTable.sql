create database if not exists `csci5409`;

USE `csci5409`;

SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `part` (

  `part_no` int(11) NOT NULL,
  `part_desc` varchar(250)  NOT NULL default '',
   PRIMARY KEY  (`part_no`)

);