-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `DbVersion` (
	`version` integer,
	CONSTRAINT `DbVersion_pk` PRIMARY KEY(`version`)
);
--> statement-breakpoint
CREATE TABLE `content` (
	`ContentID` text NOT NULL,
	`ContentType` text NOT NULL,
	`MimeType` text NOT NULL,
	`BookID` text,
	`BookTitle` text,
	`ImageId` text,
	`Title` text,
	`Attribution` text,
	`Description` text,
	`DateCreated` text,
	`ShortCoverKey` text,
	`adobe_location` text,
	`Publisher` text,
	`IsEncrypted` BOOL,
	`DateLastRead` text,
	`FirstTimeReading` BOOL,
	`ChapterIDBookmarked` text,
	`ParagraphBookmarked` integer,
	`BookmarkWordOffset` integer,
	`NumShortcovers` integer,
	`VolumeIndex` integer,
	`___NumPages` integer,
	`ReadStatus` integer,
	`___SyncTime` text,
	`___UserID` text NOT NULL,
	`PublicationId` text,
	`___FileOffset` integer,
	`___FileSize` integer,
	`___PercentRead` integer,
	`___ExpirationStatus` integer,
	`FavouritesIndex`  DEFAULT -1 NOT NULL,
	`Accessibility` integer DEFAULT 1,
	`ContentURL` text,
	`Language` text,
	`BookshelfTags` text,
	`IsDownloaded` BIT DEFAULT 1 NOT NULL,
	`FeedbackType` integer DEFAULT 0,
	`AverageRating` integer DEFAULT 0,
	`Depth` integer,
	`PageProgressDirection` text,
	`InWishlist` BOOL DEFAULT FALSE NOT NULL,
	`ISBN` text,
	`WishlistedDate` text DEFAULT "0000-00-00T00:00:00.000",
	`FeedbackTypeSynced` integer DEFAULT 0,
	`IsSocialEnabled` BOOL DEFAULT TRUE NOT NULL,
	`EpubType` integer DEFAULT -1 NOT NULL,
	`Monetization` integer DEFAULT 2,
	`ExternalId` text,
	`Series` text,
	`SeriesNumber` text,
	`Subtitle` text,
	`WordCount` integer DEFAULT -1,
	`Fallback` text,
	`RestOfBookEstimate` integer,
	`CurrentChapterEstimate` integer,
	`CurrentChapterProgress` real,
	`PocketStatus` integer DEFAULT 0,
	`UnsyncedPocketChanges` text,
	`ImageUrl` text,
	`DateAdded` text,
	`WorkId` text,
	`Properties` text,
	`RenditionSpread` text,
	`RatingCount` integer DEFAULT 0,
	`ReviewsSyncDate` text,
	`MediaOverlay` text,
	`MediaOverlayType` text,
	`RedirectPreviewUrl` text,
	`PreviewFileSize` integer,
	`EntitlementId` text,
	`CrossRevisionId` text,
	`DownloadUrl` text,
	`ReadStateSynced` BIT DEFAULT false NOT NULL,
	`TimesStartedReading` integer,
	`TimeSpentReading` integer,
	`LastTimeStartedReading` text,
	`LastTimeFinishedReading` text,
	`ApplicableSubscriptions` text,
	`ExternalIds` text,
	`PurchaseRevisionId` text,
	`SeriesID` text,
	`SeriesNumberFloat` real,
	`AdobeLoanExpiration` text,
	`HideFromHomePage` bit,
	`IsInternetArchive` BOOL DEFAULT FALSE NOT NULL,
	`titleKana` text,
	`subtitleKana` text,
	`seriesKana` text,
	`attributionKana` text,
	`publisherKana` text,
	`IsPurchaseable` BOOL DEFAULT TRUE,
	`IsSupported` BOOL DEFAULT TRUE,
	`AnnotationsSyncToken` text,
	`DateModified` text DEFAULT "0000-00-00T00:00:00.000",
	`StorePages` integer DEFAULT 0,
	`StoreWordCount` integer DEFAULT 0,
	`StoreTimeToReadLowerEstimate` integer DEFAULT 0,
	`StoreTimeToReadUpperEstimate` integer DEFAULT 0,
	`Duration` integer DEFAULT 0,
	`IsAbridged` BOOL DEFAULT NULL,
	`SyncConflictType` integer DEFAULT 0,
	CONSTRAINT `content_pk` PRIMARY KEY(`ContentID`)
);
--> statement-breakpoint
CREATE TABLE `shortcover_page` (
	`shortcoverId` text NOT NULL,
	`PageNumber` integer,
	`FormattedPage` text,
	CONSTRAINT `shortcover_page_pk` PRIMARY KEY(`shortcoverId`, `PageNumber`)
);
--> statement-breakpoint
CREATE TABLE `volume_shortcovers` (
	`volumeId` text NOT NULL,
	`shortcoverId` text NOT NULL,
	`VolumeIndex` integer,
	CONSTRAINT `volume_shortcovers_pk` PRIMARY KEY(`volumeId`, `shortcoverId`)
);
--> statement-breakpoint
CREATE TABLE `content_keys` (
	`volumeId` text NOT NULL,
	`elementId` text NOT NULL,
	`elementKey` text,
	CONSTRAINT `content_keys_pk` PRIMARY KEY(`volumeId`, `elementId`)
);
--> statement-breakpoint
CREATE TABLE `Bookmark` (
	`BookmarkID` text NOT NULL,
	`VolumeID` text NOT NULL,
	`ContentID` text NOT NULL,
	`StartContainerPath` text NOT NULL,
	`StartContainerChildIndex` integer NOT NULL,
	`StartOffset` integer NOT NULL,
	`EndContainerPath` text NOT NULL,
	`EndContainerChildIndex` integer NOT NULL,
	`EndOffset` integer NOT NULL,
	`Text` text,
	`Annotation` text,
	`ExtraAnnotationData` blob,
	`DateCreated` text,
	`ChapterProgress` real DEFAULT 0 NOT NULL,
	`Hidden` BOOL DEFAULT 0 NOT NULL,
	`Version` text,
	`DateModified` text,
	`Creator` text,
	`UUID` text,
	`UserID` text,
	`SyncTime` text,
	`Published` BIT DEFAULT false,
	`ContextString` text,
	`Type` text,
	CONSTRAINT `Bookmark_pk` PRIMARY KEY(`BookmarkID`)
);
--> statement-breakpoint
CREATE TABLE `Event` (
	`EventType` integer NOT NULL,
	`FirstOccurrence` text,
	`LastOccurrence` text,
	`EventCount` integer DEFAULT 0,
	`ContentID` text,
	`ExtraData` blob,
	`Checksum` text,
	CONSTRAINT `Event_pk` PRIMARY KEY(`EventType`, `ContentID`)
);
--> statement-breakpoint
CREATE TABLE `Achievement` (
	`Acknowledged` BOOL,
	`CompleteDescription` text,
	`DateCreated` text,
	`Difficulty` integer,
	`EventLogDescription` text,
	`Hidden` BOOL,
	`Id` text NOT NULL,
	`ImageId` text NOT NULL,
	`IncompleteDescription` text,
	`Name` text NOT NULL,
	`Ordinal` integer,
	`PercentComplete` integer,
	`Presented` BOOL,
	`Synchronized` BOOL,
	`UserId` text,
	`Checksum` text,
	`FacebookImageId` text,
	CONSTRAINT `Achievement_pk` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE TABLE `Rules` (
	`AchievementId` text,
	`EventProperty` text,
	`EventType` text,
	`GoalValue` text NOT NULL,
	`Id` text NOT NULL,
	`Operation` integer NOT NULL,
	`ParentRuleId` text,
	`ConjunctionType` integer,
	`IsConjunction` BOOL,
	`Checksum` text,
	CONSTRAINT `Rules_pk` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE TABLE `volume_tabs` (
	`volumeId` text NOT NULL,
	`tabId` text DEFAULT 'abcdefff-ffff-ffff-ffff-fffffffffffd' NOT NULL,
	CONSTRAINT `volume_tabs_pk` PRIMARY KEY(`volumeId`, `tabId`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`ContentID` text NOT NULL,
	`Rating` integer,
	`Review` text,
	`DateModified` text NOT NULL,
	CONSTRAINT `ratings_pk` PRIMARY KEY(`ContentID`)
);
--> statement-breakpoint
CREATE TABLE `ShelfContent` (
	`ShelfName` text,
	`ContentId` text,
	`DateModified` text,
	`_IsDeleted` BOOL,
	`_IsSynced` BOOL,
	CONSTRAINT `ShelfContent_pk` PRIMARY KEY(`ShelfName`, `ContentId`)
);
--> statement-breakpoint
CREATE TABLE `content_settings` (
	`ContentID` text NOT NULL,
	`ContentType` integer NOT NULL,
	`DateModified` text NOT NULL,
	`ReadingFontFamily` text,
	`ReadingFontSize` integer,
	`ReadingAlignment` text,
	`ReadingLineHeight` real,
	`ReadingLeftMargin` integer,
	`ReadingRightMargin` integer,
	`ReadingPublisherMode` integer,
	`ActivityFacebookShare` BIT DEFAULT TRUE,
	`RecentBookSearches` text,
	`AuthorNotesShown` BIT DEFAULT false,
	`LastAuthorNotesSyncTime` text,
	`ZoomFactor` integer DEFAULT 1,
	`BTBFooterSection` text,
	`SelectedDictionary` text,
	`StillReading` BIT DEFAULT FALSE,
	`SeriesShown` BIT DEFAULT FALSE,
	CONSTRAINT `content_settings_pk` PRIMARY KEY(`ContentID`, `ContentType`)
);
--> statement-breakpoint
CREATE TABLE `Shelf` (
	`CreationDate` text,
	`Id` text,
	`InternalName` text,
	`LastModified` text,
	`Name` text,
	`Type` text,
	`_IsDeleted` BOOL,
	`_IsVisible` BOOL,
	`_IsSynced` BOOL,
	`_SyncTime` text,
	`LastAccessed` text,
	CONSTRAINT `Shelf_pk` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`UserID` text NOT NULL,
	`UserKey` text NOT NULL,
	`UserDisplayName` text,
	`UserEmail` text,
	`___DeviceID` text,
	`FacebookAuthToken` text,
	`HasMadePurchase` BIT DEFAULT FALSE,
	`IsOneStoreAccount` BIT DEFAULT FALSE,
	`IsChildAccount` BIT DEFAULT FALSE,
	`RefreshToken` text,
	`AuthToken` text,
	`AuthType` text,
	`Loyalty` blob,
	`IsLibraryMigrated` BIT DEFAULT true NOT NULL,
	`SyncContinuationToken` text,
	`Subscription` integer DEFAULT 0 NOT NULL,
	`LibrarySyncType` text,
	`LibrarySyncTime` text,
	`SyncTokenAppVersion` text,
	`Storefront` text,
	`NewUserPromoCurrency` text,
	`NewUserPromoValue` real DEFAULT -1.0 NOT NULL,
	`KoboAccessToken` text,
	`KoboAccessTokenExpiry` text,
	`AnnotationsSyncToken` text,
	`PrivacyPermissions` blob,
	`AnnotationsMigrated` BIT DEFAULT false NOT NULL,
	`NotebookSyncTime` text,
	`NotebookSyncToken` text,
	CONSTRAINT `user_pk` PRIMARY KEY(`UserID`)
);
--> statement-breakpoint
CREATE TABLE `SyncQueue` (
	`Date` text,
	`VolumeId` text,
	`State` integer,
	CONSTRAINT `SyncQueue_pk` PRIMARY KEY(`VolumeId`)
);
--> statement-breakpoint
CREATE TABLE `AbTest` (
	`Id` text,
	`Expiration` text,
	`Name` text,
	`GroupId` integer,
	`Variables` text,
	`Status` integer,
	`Description` text,
	`Checksum` text,
	`TestKey` text,
	CONSTRAINT `AbTest_pk` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE TABLE `AnalyticsEvents` (
	`Id` text,
	`Type` text,
	`Timestamp` text,
	`Attributes` text,
	`Metrics` text,
	`TestGroups` text,
	`ClientApplicationVersion` text,
	`Mandatory` BIT DEFAULT FALSE,
	CONSTRAINT `AnalyticsEvents_pk` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE TABLE `Activity` (
	`Id` text,
	`Enabled` BIT DEFAULT TRUE,
	`Type` text,
	`Action` integer,
	`Date` text,
	`Data` blob,
	CONSTRAINT `Activity_pk` PRIMARY KEY(`Id`, `Type`)
);
--> statement-breakpoint
CREATE TABLE `Authors` (
	`UserId` text,
	`Avatar` text,
	`Name` text,
	`FacebookId` text,
	CONSTRAINT `Authors_pk` PRIMARY KEY(`UserId`)
);
--> statement-breakpoint
CREATE TABLE `BookAuthors` (
	`AuthorId` text,
	`BookId` text,
	CONSTRAINT `BookAuthors_pk` PRIMARY KEY(`AuthorId`, `BookId`)
);
--> statement-breakpoint
CREATE TABLE `Reviews` (
	`Id` text NOT NULL,
	`Header` text,
	`Content` text,
	`CreationDate` text,
	`VolumeId` text NOT NULL,
	`AuthorDisplayName` text,
	`Sentiment` text,
	`UserId` text,
	`Likes` integer,
	`Dislikes` integer,
	`Rating` integer,
	`SyncDate` text,
	`Status` text,
	CONSTRAINT `Reviews_pk` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE TABLE `Tab` (
	`tabId` text NOT NULL,
	`tabType` text,
	`browseTabType` text,
	`displayTitle` text,
	`parentTabId` text,
	`isDefault` BOOL,
	`maxSize` integer,
	`totalResults` integer,
	`updateFrequencyMin` integer,
	`imageID` text,
	`isLeaf` BOOL,
	`hasFeaturedLists` BOOL,
	`etag` text,
	`language` text,
	CONSTRAINT `Tab_pk` PRIMARY KEY(`tabId`)
);
--> statement-breakpoint
CREATE TABLE `OverDriveCards` (
	`CardId` integer,
	`LibraryKey` text NOT NULL,
	`BestLibraryKey` text NOT NULL,
	`WebsiteId` integer NOT NULL,
	`Name` text,
	`LastModified` text,
	CONSTRAINT `OverDriveCards_pk` PRIMARY KEY(`CardId`)
);
--> statement-breakpoint
CREATE TABLE `OverDriveLibrary` (
	`Selected` BIT DEFAULT false NOT NULL,
	`WebsiteId` integer,
	`LibraryKey` text,
	`Name` text,
	CONSTRAINT `OverDriveLibrary_pk` PRIMARY KEY(`WebsiteId`)
);
--> statement-breakpoint
CREATE TABLE `OverDriveCheckoutBook` (
	`id` text,
	`title` text,
	`libraryKey` text,
	`cardId` text,
	`isAvailable` text,
	`suspensionFlag` BIT,
	`placedDate` text,
	`expireDate` text,
	`estimatedAvailableDate` text,
	CONSTRAINT `OverDriveCheckoutBook_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `WordList` (
	`Text` text,
	`VolumeId` text,
	`DictSuffix` text,
	`DateCreated` text,
	CONSTRAINT `WordList_pk` PRIMARY KEY(`Text`)
);
--> statement-breakpoint
CREATE TABLE `Wishlist` (
	`CrossRevisionId` text,
	`DateModified` text NOT NULL,
	`IsAdded` BOOL,
	`IsSynced` BOOL,
	CONSTRAINT `Wishlist_pk` PRIMARY KEY(`CrossRevisionId`)
);
--> statement-breakpoint
CREATE TABLE `SubscriptionProducts` (
	`CrossRevisionId` text NOT NULL,
	`Id` text NOT NULL,
	`Name` text,
	`IsPreOrder` BOOL,
	`Tiers` text,
	`ActivationDate` text,
	`DeactivationDate` text,
	CONSTRAINT `SubscriptionProducts_pk` PRIMARY KEY(`CrossRevisionId`)
);
--> statement-breakpoint
CREATE TABLE `DropboxItem` (
	`Id` text NOT NULL,
	`Json` text,
	CONSTRAINT `DropboxItem_pk` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE TABLE `KoboPlusAssetGroup` (
	`Id` text NOT NULL,
	`AssetGroup` text,
	`Timestamp` text,
	`Name` text,
	`Url` text,
	`Etag` text,
	`TimestampTo` text,
	`Shown` BOOL DEFAULT FALSE,
	CONSTRAINT `KoboPlusAssetGroup_pk` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE TABLE `KoboPlusAssets` (
	`AssetGroupId` text NOT NULL,
	`Key` text NOT NULL,
	`Language` text NOT NULL,
	`Type` text,
	`Value` text,
	CONSTRAINT `KoboPlusAssets_pk` PRIMARY KEY(`AssetGroupId`, `Key`, `Language`),
	CONSTRAINT `fk_KoboPlusAssets_AssetGroupId_KoboPlusAssetGroup_Id_fk` FOREIGN KEY (`AssetGroupId`) REFERENCES `KoboPlusAssetGroup`(`Id`)
);
--> statement-breakpoint
CREATE TABLE `GDriveItem` (
	`Id` text NOT NULL,
	`Json` text,
	`Path` text,
	CONSTRAINT `GDriveItem_pk` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE INDEX `activity_id_index` ON `Activity` (`Id`);--> statement-breakpoint
CREATE INDEX `analytics_events_timestamp` ON `AnalyticsEvents` (`Timestamp`);--> statement-breakpoint
CREATE INDEX `bookmark_volume` ON `Bookmark` (`VolumeID`);--> statement-breakpoint
CREATE INDEX `bookmark_content` ON `Bookmark` (`ContentID`);--> statement-breakpoint
CREATE INDEX `content_bookid_index` ON `content` (`BookID`);--> statement-breakpoint
CREATE INDEX `content_keys_volume` ON `content_keys` (`volumeId`);--> statement-breakpoint
CREATE INDEX `content_settings_index` ON `content_settings` (`ContentID`,`ContentType`);--> statement-breakpoint
CREATE INDEX `kobo_plus_asset_group_index` ON `KoboPlusAssetGroup` (`AssetGroup`);--> statement-breakpoint
CREATE INDEX `OverDriveCards_LibraryKey_index` ON `OverDriveCards` (`LibraryKey`);--> statement-breakpoint
CREATE INDEX `shelf_creationdate_index` ON `Shelf` (`CreationDate`);--> statement-breakpoint
CREATE INDEX `shelf_name_index` ON `Shelf` (`Name`);--> statement-breakpoint
CREATE INDEX `shelf_id_index` ON `Shelf` (`Id`);--> statement-breakpoint
CREATE INDEX `shelfcontent_datemodified_index` ON `ShelfContent` (`DateModified`);--> statement-breakpoint
CREATE INDEX `volume_shortcovers_shortcoverId` ON `volume_shortcovers` (`shortcoverId`);--> statement-breakpoint
CREATE INDEX `volume_tabs_tabId` ON `volume_tabs` (`tabId`);--> statement-breakpoint
CREATE INDEX `volume_tabs_volumeId` ON `volume_tabs` (`volumeId`);
*/