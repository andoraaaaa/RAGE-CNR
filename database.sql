-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Sep 06, 2018 at 12:48 PM
-- Server version: 10.1.13-MariaDB
-- PHP Version: 5.6.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `this_does_not_matter_just_import_it`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `ID` int(10) UNSIGNED NOT NULL,
  `Username` varchar(32) NOT NULL,
  `Password` varchar(64) NOT NULL,
  `Admin` tinyint(1) NOT NULL DEFAULT '0',
  `Money` int(11) NOT NULL,
  `Kills` int(11) NOT NULL DEFAULT '0',
  `Deaths` int(11) NOT NULL DEFAULT '0',
  `RegisterDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `bans`
--

CREATE TABLE `bans` (
  `ID` int(10) UNSIGNED NOT NULL,
  `AccountID` int(10) UNSIGNED NOT NULL,
  `Reason` varchar(64) NOT NULL,
  `StartDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `EndDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `garages`
--

CREATE TABLE `garages` (
  `ID` int(10) UNSIGNED NOT NULL,
  `GarageX` decimal(10,5) NOT NULL,
  `GarageY` decimal(10,5) NOT NULL,
  `GarageZ` decimal(10,5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log_admin`
--

CREATE TABLE `log_admin` (
  `AdminID` int(10) UNSIGNED NOT NULL,
  `TargetID` int(10) UNSIGNED NOT NULL,
  `Action` enum('ACTION_GIVEMONEY','ACTION_GIVEWEAPON','ACTION_KICK','ACTION_BAN') NOT NULL,
  `Details` varchar(255) NOT NULL,
  `Date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log_chat`
--

CREATE TABLE `log_chat` (
  `AccountID` int(10) UNSIGNED NOT NULL,
  `Message` varchar(255) NOT NULL,
  `Date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log_deaths`
--

CREATE TABLE `log_deaths` (
  `KillerID` int(10) UNSIGNED NOT NULL,
  `PlayerID` int(10) UNSIGNED NOT NULL,
  `KillerTeam` varchar(24) NOT NULL,
  `PlayerTeam` varchar(24) NOT NULL,
  `ReasonHash` int(10) UNSIGNED NOT NULL,
  `KillerX` decimal(10,5) NOT NULL,
  `KillerY` decimal(10,5) NOT NULL,
  `KillerZ` decimal(10,5) NOT NULL,
  `PlayerX` decimal(10,5) NOT NULL,
  `PlayerY` decimal(10,5) NOT NULL,
  `PlayerZ` decimal(10,5) NOT NULL,
  `Date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log_garage`
--

CREATE TABLE `log_garage` (
  `AccountID` int(10) UNSIGNED NOT NULL,
  `GarageID` int(10) UNSIGNED NOT NULL,
  `VehicleHash` int(10) UNSIGNED NOT NULL,
  `SpawnX` decimal(10,5) NOT NULL,
  `SpawnY` decimal(10,5) NOT NULL,
  `SpawnZ` decimal(10,5) NOT NULL,
  `Date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log_joins`
--

CREATE TABLE `log_joins` (
  `Name` varchar(32) NOT NULL,
  `SocialClub` varchar(16) NOT NULL,
  `Serial` varchar(128) NOT NULL,
  `IP` varbinary(16) NOT NULL,
  `Date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log_logins`
--

CREATE TABLE `log_logins` (
  `AccountID` int(10) UNSIGNED NOT NULL,
  `Name` varchar(32) NOT NULL,
  `SocialClub` varchar(16) NOT NULL,
  `Serial` varchar(128) NOT NULL,
  `IP` varbinary(16) NOT NULL,
  `Date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log_privatechat`
--

CREATE TABLE `log_privatechat` (
  `SenderID` int(10) UNSIGNED NOT NULL,
  `ReceiverID` int(10) UNSIGNED NOT NULL,
  `Message` varchar(255) NOT NULL,
  `Date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log_sentmoney`
--

CREATE TABLE `log_sentmoney` (
  `SenderID` int(10) UNSIGNED NOT NULL,
  `ReceiverID` int(10) UNSIGNED NOT NULL,
  `Amount` int(11) NOT NULL,
  `Date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log_teamchat`
--

CREATE TABLE `log_teamchat` (
  `AccountID` int(10) UNSIGNED NOT NULL,
  `Team` varchar(24) NOT NULL,
  `Message` varchar(255) NOT NULL,
  `Date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `log_weaponshop`
--

CREATE TABLE `log_weaponshop` (
  `AccountID` int(10) UNSIGNED NOT NULL,
  `ShopID` int(10) UNSIGNED NOT NULL,
  `WeaponHash` int(10) UNSIGNED NOT NULL,
  `Date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `turfs`
--

CREATE TABLE `turfs` (
  `ID` int(10) UNSIGNED NOT NULL,
  `Name` varchar(32) NOT NULL,
  `Income` int(10) UNSIGNED NOT NULL,
  `TurfX` decimal(10,5) NOT NULL,
  `TurfY` decimal(10,5) NOT NULL,
  `TurfZ` decimal(10,5) NOT NULL,
  `Radius` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `weapon_shops`
--

CREATE TABLE `weapon_shops` (
  `ID` int(10) UNSIGNED NOT NULL,
  `ShopX` decimal(10,5) NOT NULL,
  `ShopY` decimal(10,5) NOT NULL,
  `ShopZ` decimal(10,5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `bans`
--
ALTER TABLE `bans`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `AccountID` (`AccountID`) USING BTREE;

--
-- Indexes for table `garages`
--
ALTER TABLE `garages`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `log_admin`
--
ALTER TABLE `log_admin`
  ADD KEY `AdminID` (`AdminID`),
  ADD KEY `TargetID` (`TargetID`);

--
-- Indexes for table `log_chat`
--
ALTER TABLE `log_chat`
  ADD KEY `AccountID` (`AccountID`);

--
-- Indexes for table `log_deaths`
--
ALTER TABLE `log_deaths`
  ADD KEY `KillerID` (`KillerID`,`PlayerID`),
  ADD KEY `player_account_relation` (`PlayerID`);

--
-- Indexes for table `log_garage`
--
ALTER TABLE `log_garage`
  ADD KEY `AccountID` (`AccountID`),
  ADD KEY `GarageID` (`GarageID`);

--
-- Indexes for table `log_logins`
--
ALTER TABLE `log_logins`
  ADD KEY `AccountID` (`AccountID`);

--
-- Indexes for table `log_privatechat`
--
ALTER TABLE `log_privatechat`
  ADD KEY `SenderID` (`SenderID`),
  ADD KEY `ReceiverID` (`ReceiverID`);

--
-- Indexes for table `log_sentmoney`
--
ALTER TABLE `log_sentmoney`
  ADD KEY `SenderID` (`SenderID`),
  ADD KEY `ReceiverID` (`ReceiverID`);

--
-- Indexes for table `log_teamchat`
--
ALTER TABLE `log_teamchat`
  ADD KEY `AccountID` (`AccountID`);

--
-- Indexes for table `log_weaponshop`
--
ALTER TABLE `log_weaponshop`
  ADD KEY `AccountID` (`AccountID`),
  ADD KEY `ShopID` (`ShopID`);

--
-- Indexes for table `turfs`
--
ALTER TABLE `turfs`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `weapon_shops`
--
ALTER TABLE `weapon_shops`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `bans`
--
ALTER TABLE `bans`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `garages`
--
ALTER TABLE `garages`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `turfs`
--
ALTER TABLE `turfs`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `weapon_shops`
--
ALTER TABLE `weapon_shops`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `bans`
--
ALTER TABLE `bans`
  ADD CONSTRAINT `ban_account_relation` FOREIGN KEY (`AccountID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `log_admin`
--
ALTER TABLE `log_admin`
  ADD CONSTRAINT `admin_account_relation` FOREIGN KEY (`AdminID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `target_account_relation` FOREIGN KEY (`TargetID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `log_chat`
--
ALTER TABLE `log_chat`
  ADD CONSTRAINT `account_relation` FOREIGN KEY (`AccountID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `log_deaths`
--
ALTER TABLE `log_deaths`
  ADD CONSTRAINT `killer_account_relation` FOREIGN KEY (`KillerID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `player_account_relation` FOREIGN KEY (`PlayerID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `log_garage`
--
ALTER TABLE `log_garage`
  ADD CONSTRAINT `garage_account_relation` FOREIGN KEY (`AccountID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `garage_relation` FOREIGN KEY (`GarageID`) REFERENCES `garages` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `log_logins`
--
ALTER TABLE `log_logins`
  ADD CONSTRAINT `login_account_relation` FOREIGN KEY (`AccountID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `log_privatechat`
--
ALTER TABLE `log_privatechat`
  ADD CONSTRAINT `pchat_receiver_relation` FOREIGN KEY (`ReceiverID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `pchat_sender_relation` FOREIGN KEY (`SenderID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `log_sentmoney`
--
ALTER TABLE `log_sentmoney`
  ADD CONSTRAINT `moneylog_receiver_relation` FOREIGN KEY (`ReceiverID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `moneylog_sender_relation` FOREIGN KEY (`SenderID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `log_teamchat`
--
ALTER TABLE `log_teamchat`
  ADD CONSTRAINT `tchat_account_relation` FOREIGN KEY (`AccountID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `log_weaponshop`
--
ALTER TABLE `log_weaponshop`
  ADD CONSTRAINT `wshop_account_relation` FOREIGN KEY (`AccountID`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `wshop_shop_relation` FOREIGN KEY (`ShopID`) REFERENCES `weapon_shops` (`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
