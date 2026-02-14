import { sql } from "drizzle-orm";
import {
  blob,
  customType,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const dbVersion = sqliteTable("DbVersion", {
  version: integer().primaryKey(),
});

export const content = sqliteTable(
  "content",
  {
    contentId: text("ContentID").primaryKey(),
    contentType: text("ContentType").notNull(),
    mimeType: text("MimeType").notNull(),
    bookId: text("BookID"),
    bookTitle: text("BookTitle"),
    imageId: text("ImageId"),
    title: text("Title"),
    attribution: text("Attribution"),
    description: text("Description"),
    dateCreated: text("DateCreated"),
    shortCoverKey: text("ShortCoverKey"),
    adobeLocation: text("adobe_location"),
    publisher: text("Publisher"),
    isEncrypted: customType({ dataType: () => "BOOL" })("IsEncrypted"),
    dateLastRead: text("DateLastRead"),
    firstTimeReading: customType({ dataType: () => "BOOL" })(
      "FirstTimeReading",
    ),
    chapterIdBookmarked: text("ChapterIDBookmarked"),
    paragraphBookmarked: integer("ParagraphBookmarked"),
    bookmarkWordOffset: integer("BookmarkWordOffset"),
    numShortcovers: integer("NumShortcovers"),
    volumeIndex: integer("VolumeIndex"),
    numPages: integer("___NumPages"),
    readStatus: integer("ReadStatus"),
    syncTime: text("___SyncTime"),
    userId: text("___UserID").notNull(),
    publicationId: text("PublicationId"),
    fileOffset: integer("___FileOffset"),
    fileSize: integer("___FileSize"),
    percentRead: integer("___PercentRead"),
    expirationStatus: integer("___ExpirationStatus"),
    favouritesIndex: customType({ dataType: () => "INTEGER" })(
      "FavouritesIndex",
    )
      .default("-1")
      .notNull(),
    accessibility: integer("Accessibility").default(1),
    contentUrl: text("ContentURL"),
    language: text("Language"),
    bookshelfTags: text("BookshelfTags"),
    isDownloaded: customType({ dataType: () => "BIT" })("IsDownloaded")
      .default("1")
      .notNull(),
    feedbackType: integer("FeedbackType").default(0),
    averageRating: integer("AverageRating").default(0),
    depth: integer("Depth"),
    pageProgressDirection: text("PageProgressDirection"),
    inWishlist: customType({ dataType: () => "BOOL" })("InWishlist")
      .default("FALSE")
      .notNull(),
    isbn: text("ISBN"),
    wishlistedDate: text("WishlistedDate").default(
      sql`"0000-00-00T00:00:00.000"`,
    ),
    feedbackTypeSynced: integer("FeedbackTypeSynced").default(0),
    isSocialEnabled: customType({ dataType: () => "BOOL" })("IsSocialEnabled")
      .default("TRUE")
      .notNull(),
    epubType: integer("EpubType").default(-1).notNull(),
    monetization: integer("Monetization").default(2),
    externalId: text("ExternalId"),
    series: text("Series"),
    seriesNumber: text("SeriesNumber"),
    subtitle: text("Subtitle"),
    wordCount: integer("WordCount").default(-1),
    fallback: text("Fallback"),
    restOfBookEstimate: integer("RestOfBookEstimate"),
    currentChapterEstimate: integer("CurrentChapterEstimate"),
    currentChapterProgress: real("CurrentChapterProgress"),
    pocketStatus: integer("PocketStatus").default(0),
    unsyncedPocketChanges: text("UnsyncedPocketChanges"),
    imageUrl: text("ImageUrl"),
    dateAdded: text("DateAdded"),
    workId: text("WorkId"),
    properties: text("Properties"),
    renditionSpread: text("RenditionSpread"),
    ratingCount: integer("RatingCount").default(0),
    reviewsSyncDate: text("ReviewsSyncDate"),
    mediaOverlay: text("MediaOverlay"),
    mediaOverlayType: text("MediaOverlayType"),
    redirectPreviewUrl: text("RedirectPreviewUrl"),
    previewFileSize: integer("PreviewFileSize"),
    entitlementId: text("EntitlementId"),
    crossRevisionId: text("CrossRevisionId"),
    downloadUrl: text("DownloadUrl"),
    readStateSynced: customType({ dataType: () => "BIT" })("ReadStateSynced")
      .default("false")
      .notNull(),
    timesStartedReading: integer("TimesStartedReading"),
    timeSpentReading: integer("TimeSpentReading"),
    lastTimeStartedReading: text("LastTimeStartedReading"),
    lastTimeFinishedReading: text("LastTimeFinishedReading"),
    applicableSubscriptions: text("ApplicableSubscriptions"),
    externalIds: text("ExternalIds"),
    purchaseRevisionId: text("PurchaseRevisionId"),
    seriesId: text("SeriesID"),
    seriesNumberFloat: real("SeriesNumberFloat"),
    adobeLoanExpiration: text("AdobeLoanExpiration"),
    hideFromHomePage: customType({ dataType: () => "bit" })("HideFromHomePage"),
    isInternetArchive: customType({ dataType: () => "BOOL" })(
      "IsInternetArchive",
    )
      .default("FALSE")
      .notNull(),
    titleKana: text(),
    subtitleKana: text(),
    seriesKana: text(),
    attributionKana: text(),
    publisherKana: text(),
    isPurchaseable: customType({ dataType: () => "BOOL" })(
      "IsPurchaseable",
    ).default("TRUE"),
    isSupported: customType({ dataType: () => "BOOL" })("IsSupported").default(
      "TRUE",
    ),
    annotationsSyncToken: text("AnnotationsSyncToken"),
    dateModified: text("DateModified").default(sql`"0000-00-00T00:00:00.000"`),
    storePages: integer("StorePages").default(0),
    storeWordCount: integer("StoreWordCount").default(0),
    storeTimeToReadLowerEstimate: integer(
      "StoreTimeToReadLowerEstimate",
    ).default(0),
    storeTimeToReadUpperEstimate: integer(
      "StoreTimeToReadUpperEstimate",
    ).default(0),
    duration: integer("Duration").default(0),
    isAbridged: customType({ dataType: () => "BOOL" })("IsAbridged").default(
      "NULL",
    ),
    syncConflictType: integer("SyncConflictType").default(0),
  },
  table => [index("content_bookid_index").on(table.bookId)],
);

export const shortcoverPage = sqliteTable(
  "shortcover_page",
  {
    shortcoverId: text().notNull(),
    pageNumber: integer("PageNumber"),
    formattedPage: text("FormattedPage"),
  },
  table => [
    primaryKey({
      columns: [table.shortcoverId, table.pageNumber],
      name: "shortcover_page_pk",
    }),
  ],
);

export const volumeShortcovers = sqliteTable(
  "volume_shortcovers",
  {
    volumeId: text().notNull(),
    shortcoverId: text().notNull(),
    volumeIndex: integer("VolumeIndex"),
  },
  table => [
    index("volume_shortcovers_shortcoverId").on(table.shortcoverId),
    primaryKey({
      columns: [table.volumeId, table.shortcoverId],
      name: "volume_shortcovers_pk",
    }),
  ],
);

export const contentKeys = sqliteTable(
  "content_keys",
  {
    volumeId: text().notNull(),
    elementId: text().notNull(),
    elementKey: text(),
  },
  table => [
    index("content_keys_volume").on(table.volumeId),
    primaryKey({
      columns: [table.volumeId, table.elementId],
      name: "content_keys_pk",
    }),
  ],
);

export const bookmark = sqliteTable(
  "Bookmark",
  {
    bookmarkId: text("BookmarkID").primaryKey(),
    volumeId: text("VolumeID").notNull(),
    contentId: text("ContentID").notNull(),
    startContainerPath: text("StartContainerPath").notNull(),
    startContainerChildIndex: integer("StartContainerChildIndex").notNull(),
    startOffset: integer("StartOffset").notNull(),
    endContainerPath: text("EndContainerPath").notNull(),
    endContainerChildIndex: integer("EndContainerChildIndex").notNull(),
    endOffset: integer("EndOffset").notNull(),
    text: text("Text"),
    annotation: text("Annotation"),
    extraAnnotationData: blob("ExtraAnnotationData"),
    dateCreated: text("DateCreated"),
    chapterProgress: real("ChapterProgress").default(0).notNull(),
    hidden: customType({ dataType: () => "BOOL" })("Hidden")
      .default("0")
      .notNull(),
    version: text("Version"),
    dateModified: text("DateModified"),
    creator: text("Creator"),
    uuid: text("UUID"),
    userId: text("UserID"),
    syncTime: text("SyncTime"),
    published: customType({ dataType: () => "BIT" })("Published").default(
      "false",
    ),
    contextString: text("ContextString"),
    type: text("Type"),
  },
  table => [
    index("bookmark_volume").on(table.volumeId),
    index("bookmark_content").on(table.contentId),
  ],
);

export const event = sqliteTable(
  "Event",
  {
    eventType: integer("EventType").notNull(),
    firstOccurrence: text("FirstOccurrence"),
    lastOccurrence: text("LastOccurrence"),
    eventCount: integer("EventCount").default(0),
    contentId: text("ContentID"),
    extraData: blob("ExtraData"),
    checksum: text("Checksum"),
  },
  table => [
    primaryKey({
      columns: [table.eventType, table.contentId],
      name: "Event_pk",
    }),
  ],
);

export const achievement = sqliteTable("Achievement", {
  acknowledged: customType({ dataType: () => "BOOL" })("Acknowledged"),
  completeDescription: text("CompleteDescription"),
  dateCreated: text("DateCreated"),
  difficulty: integer("Difficulty"),
  eventLogDescription: text("EventLogDescription"),
  hidden: customType({ dataType: () => "BOOL" })("Hidden"),
  id: text("Id").primaryKey(),
  imageId: text("ImageId").notNull(),
  incompleteDescription: text("IncompleteDescription"),
  name: text("Name").notNull(),
  ordinal: integer("Ordinal"),
  percentComplete: integer("PercentComplete"),
  presented: customType({ dataType: () => "BOOL" })("Presented"),
  synchronized: customType({ dataType: () => "BOOL" })("Synchronized"),
  userId: text("UserId"),
  checksum: text("Checksum"),
  facebookImageId: text("FacebookImageId"),
});

export const rules = sqliteTable("Rules", {
  achievementId: text("AchievementId"),
  eventProperty: text("EventProperty"),
  eventType: text("EventType"),
  goalValue: text("GoalValue").notNull(),
  id: text("Id").primaryKey(),
  operation: integer("Operation").notNull(),
  parentRuleId: text("ParentRuleId"),
  conjunctionType: integer("ConjunctionType"),
  isConjunction: customType({ dataType: () => "BOOL" })("IsConjunction"),
  checksum: text("Checksum"),
});

export const volumeTabs = sqliteTable(
  "volume_tabs",
  {
    volumeId: text().notNull(),
    tabId: text().default("abcdefff-ffff-ffff-ffff-fffffffffffd").notNull(),
  },
  table => [
    index("volume_tabs_tabId").on(table.tabId),
    index("volume_tabs_volumeId").on(table.volumeId),
    primaryKey({
      columns: [table.volumeId, table.tabId],
      name: "volume_tabs_pk",
    }),
  ],
);

export const ratings = sqliteTable("ratings", {
  contentId: text("ContentID").primaryKey(),
  rating: integer("Rating"),
  review: text("Review"),
  dateModified: text("DateModified").notNull(),
});

export const shelfContent = sqliteTable(
  "ShelfContent",
  {
    shelfName: text("ShelfName"),
    contentId: text("ContentId"),
    dateModified: text("DateModified"),
    isDeleted: customType({ dataType: () => "BOOL" })("_IsDeleted"),
    isSynced: customType({ dataType: () => "BOOL" })("_IsSynced"),
  },
  table => [
    index("shelfcontent_datemodified_index").on(table.dateModified),
    primaryKey({
      columns: [table.shelfName, table.contentId],
      name: "ShelfContent_pk",
    }),
  ],
);

export const contentSettings = sqliteTable(
  "content_settings",
  {
    contentId: text("ContentID").notNull(),
    contentType: integer("ContentType").notNull(),
    dateModified: text("DateModified").notNull(),
    readingFontFamily: text("ReadingFontFamily"),
    readingFontSize: integer("ReadingFontSize"),
    readingAlignment: text("ReadingAlignment"),
    readingLineHeight: real("ReadingLineHeight"),
    readingLeftMargin: integer("ReadingLeftMargin"),
    readingRightMargin: integer("ReadingRightMargin"),
    readingPublisherMode: integer("ReadingPublisherMode"),
    activityFacebookShare: customType({ dataType: () => "BIT" })(
      "ActivityFacebookShare",
    ).default("TRUE"),
    recentBookSearches: text("RecentBookSearches"),
    authorNotesShown: customType({ dataType: () => "BIT" })(
      "AuthorNotesShown",
    ).default("false"),
    lastAuthorNotesSyncTime: text("LastAuthorNotesSyncTime"),
    zoomFactor: integer("ZoomFactor").default(1),
    btbFooterSection: text("BTBFooterSection"),
    selectedDictionary: text("SelectedDictionary"),
    stillReading: customType({ dataType: () => "BIT" })("StillReading").default(
      "FALSE",
    ),
    seriesShown: customType({ dataType: () => "BIT" })("SeriesShown").default(
      "FALSE",
    ),
  },
  table => [
    index("content_settings_index").on(table.contentId, table.contentType),
    primaryKey({
      columns: [table.contentId, table.contentType],
      name: "content_settings_pk",
    }),
  ],
);

export const shelf = sqliteTable(
  "Shelf",
  {
    creationDate: text("CreationDate"),
    id: text("Id").primaryKey(),
    internalName: text("InternalName"),
    lastModified: text("LastModified"),
    name: text("Name"),
    type: text("Type"),
    isDeleted: customType({ dataType: () => "BOOL" })("_IsDeleted"),
    isVisible: customType({ dataType: () => "BOOL" })("_IsVisible"),
    isSynced: customType({ dataType: () => "BOOL" })("_IsSynced"),
    syncTime: text("_SyncTime"),
    lastAccessed: text("LastAccessed"),
  },
  table => [
    index("shelf_creationdate_index").on(table.creationDate),
    index("shelf_name_index").on(table.name),
    index("shelf_id_index").on(table.id),
  ],
);

export const user = sqliteTable("user", {
  userId: text("UserID").primaryKey(),
  userKey: text("UserKey").notNull(),
  userDisplayName: text("UserDisplayName"),
  userEmail: text("UserEmail"),
  deviceId: text("___DeviceID"),
  facebookAuthToken: text("FacebookAuthToken"),
  hasMadePurchase: customType({ dataType: () => "BIT" })(
    "HasMadePurchase",
  ).default("FALSE"),
  isOneStoreAccount: customType({ dataType: () => "BIT" })(
    "IsOneStoreAccount",
  ).default("FALSE"),
  isChildAccount: customType({ dataType: () => "BIT" })(
    "IsChildAccount",
  ).default("FALSE"),
  refreshToken: text("RefreshToken"),
  authToken: text("AuthToken"),
  authType: text("AuthType"),
  loyalty: blob("Loyalty"),
  isLibraryMigrated: customType({ dataType: () => "BIT" })("IsLibraryMigrated")
    .default("true")
    .notNull(),
  syncContinuationToken: text("SyncContinuationToken"),
  subscription: integer("Subscription").default(0).notNull(),
  librarySyncType: text("LibrarySyncType"),
  librarySyncTime: text("LibrarySyncTime"),
  syncTokenAppVersion: text("SyncTokenAppVersion"),
  storefront: text("Storefront"),
  newUserPromoCurrency: text("NewUserPromoCurrency"),
  newUserPromoValue: real("NewUserPromoValue").default(-1.0).notNull(),
  koboAccessToken: text("KoboAccessToken"),
  koboAccessTokenExpiry: text("KoboAccessTokenExpiry"),
  annotationsSyncToken: text("AnnotationsSyncToken"),
  privacyPermissions: blob("PrivacyPermissions"),
  annotationsMigrated: customType({ dataType: () => "BIT" })(
    "AnnotationsMigrated",
  )
    .default("false")
    .notNull(),
  notebookSyncTime: text("NotebookSyncTime"),
  notebookSyncToken: text("NotebookSyncToken"),
});

export const syncQueue = sqliteTable("SyncQueue", {
  date: text("Date"),
  volumeId: text("VolumeId").primaryKey(),
  state: integer("State"),
});

export const abTest = sqliteTable("AbTest", {
  id: text("Id").primaryKey(),
  expiration: text("Expiration"),
  name: text("Name"),
  groupId: integer("GroupId"),
  variables: text("Variables"),
  status: integer("Status"),
  description: text("Description"),
  checksum: text("Checksum"),
  testKey: text("TestKey"),
});

export const analyticsEvents = sqliteTable(
  "AnalyticsEvents",
  {
    id: text("Id").primaryKey(),
    type: text("Type"),
    timestamp: text("Timestamp"),
    attributes: text("Attributes"),
    metrics: text("Metrics"),
    testGroups: text("TestGroups"),
    clientApplicationVersion: text("ClientApplicationVersion"),
    mandatory: customType({ dataType: () => "BIT" })("Mandatory").default(
      "FALSE",
    ),
  },
  table => [index("analytics_events_timestamp").on(table.timestamp)],
);

export const activity = sqliteTable(
  "Activity",
  {
    id: text("Id"),
    enabled: customType({ dataType: () => "BIT" })("Enabled").default("TRUE"),
    type: text("Type"),
    action: integer("Action"),
    date: text("Date"),
    data: blob("Data"),
  },
  table => [
    index("activity_id_index").on(table.id),
    primaryKey({ columns: [table.id, table.type], name: "Activity_pk" }),
  ],
);

export const authors = sqliteTable("Authors", {
  userId: text("UserId").primaryKey(),
  avatar: text("Avatar"),
  name: text("Name"),
  facebookId: text("FacebookId"),
});

export const bookAuthors = sqliteTable(
  "BookAuthors",
  {
    authorId: text("AuthorId"),
    bookId: text("BookId"),
  },
  table => [
    primaryKey({
      columns: [table.authorId, table.bookId],
      name: "BookAuthors_pk",
    }),
  ],
);

export const reviews = sqliteTable("Reviews", {
  id: text("Id").primaryKey(),
  header: text("Header"),
  content: text("Content"),
  creationDate: text("CreationDate"),
  volumeId: text("VolumeId").notNull(),
  authorDisplayName: text("AuthorDisplayName"),
  sentiment: text("Sentiment"),
  userId: text("UserId"),
  likes: integer("Likes"),
  dislikes: integer("Dislikes"),
  rating: integer("Rating"),
  syncDate: text("SyncDate"),
  status: text("Status"),
});

export const tab = sqliteTable("Tab", {
  tabId: text().primaryKey(),
  tabType: text(),
  browseTabType: text(),
  displayTitle: text(),
  parentTabId: text(),
  isDefault: customType({ dataType: () => "BOOL" })(),
  maxSize: integer(),
  totalResults: integer(),
  updateFrequencyMin: integer(),
  imageId: text(),
  isLeaf: customType({ dataType: () => "BOOL" })(),
  hasFeaturedLists: customType({ dataType: () => "BOOL" })(),
  etag: text(),
  language: text(),
});

export const overDriveCards = sqliteTable(
  "OverDriveCards",
  {
    cardId: integer("CardId").primaryKey(),
    libraryKey: text("LibraryKey").notNull(),
    bestLibraryKey: text("BestLibraryKey").notNull(),
    websiteId: integer("WebsiteId").notNull(),
    name: text("Name"),
    lastModified: text("LastModified"),
  },
  table => [index("overdrive_cards_library_key_index").on(table.libraryKey)],
);

export const overDriveLibrary = sqliteTable("OverDriveLibrary", {
  selected: customType({ dataType: () => "BIT" })("Selected")
    .default("false")
    .notNull(),
  websiteId: integer("WebsiteId").primaryKey(),
  libraryKey: text("LibraryKey"),
  name: text("Name"),
});

export const overDriveCheckoutBook = sqliteTable("OverDriveCheckoutBook", {
  id: text().primaryKey(),
  title: text(),
  libraryKey: text(),
  cardId: text(),
  isAvailable: text(),
  suspensionFlag: customType({ dataType: () => "BIT" })(),
  placedDate: text(),
  expireDate: text(),
  estimatedAvailableDate: text(),
});

export const wordList = sqliteTable("WordList", {
  text: text("Text").primaryKey(),
  volumeId: text("VolumeId"),
  dictSuffix: text("DictSuffix"),
  dateCreated: text("DateCreated"),
});

export const wishlist = sqliteTable("Wishlist", {
  crossRevisionId: text("CrossRevisionId").primaryKey(),
  dateModified: text("DateModified").notNull(),
  isAdded: customType({ dataType: () => "BOOL" })("IsAdded"),
  isSynced: customType({ dataType: () => "BOOL" })("IsSynced"),
});

export const subscriptionProducts = sqliteTable("SubscriptionProducts", {
  crossRevisionId: text("CrossRevisionId").primaryKey(),
  id: text("Id").notNull(),
  name: text("Name"),
  isPreOrder: customType({ dataType: () => "BOOL" })("IsPreOrder"),
  tiers: text("Tiers"),
  activationDate: text("ActivationDate"),
  deactivationDate: text("DeactivationDate"),
});

export const dropboxItem = sqliteTable("DropboxItem", {
  id: text("Id").primaryKey(),
  json: text("Json"),
});

export const koboPlusAssetGroup = sqliteTable(
  "KoboPlusAssetGroup",
  {
    id: text("Id").primaryKey(),
    assetGroup: text("AssetGroup"),
    timestamp: text("Timestamp"),
    name: text("Name"),
    url: text("Url"),
    etag: text("Etag"),
    timestampTo: text("TimestampTo"),
    shown: customType({ dataType: () => "BOOL" })("Shown").default("FALSE"),
  },
  table => [index("kobo_plus_asset_group_index").on(table.assetGroup)],
);

export const koboPlusAssets = sqliteTable(
  "KoboPlusAssets",
  {
    assetGroupId: text("AssetGroupId")
      .notNull()
      .references(() => koboPlusAssetGroup.id),
    key: text("Key").notNull(),
    language: text("Language").notNull(),
    type: text("Type"),
    value: text("Value"),
  },
  table => [
    primaryKey({
      columns: [table.assetGroupId, table.key, table.language],
      name: "KoboPlusAssets_pk",
    }),
  ],
);

export const gdriveItem = sqliteTable("GDriveItem", {
  id: text("Id").primaryKey(),
  json: text("Json"),
  path: text("Path"),
});
