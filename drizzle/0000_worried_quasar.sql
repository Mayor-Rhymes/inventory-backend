CREATE TABLE `products` (
	`id` varchar(256) NOT NULL,
	`brand` text NOT NULL,
	`name` text NOT NULL,
	`price` decimal(19,4) NOT NULL,
	`quantity` int unsigned NOT NULL,
	`color` enum('red','green','yellow','blue','indigo','purple','brown','gold','black','maroon'),
	`category` enum('Fashion','Electronics','Beauty and Personal Care','Baby','Arts and Crafts','Computers','Mobile Phone'),
	`createdAt` timestamp(6) NOT NULL DEFAULT (now()),
	`updatedAt` timestamp(6) NOT NULL DEFAULT (now()),
	`workspaceId` varchar(256) NOT NULL,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`workspaceId` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`password` text NOT NULL,
	`workspacename` text NOT NULL,
	`createdAt` timestamp(6) NOT NULL DEFAULT (now()),
	`updatedAt` timestamp(6) NOT NULL DEFAULT (now()),
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspaces_workspacename_unique` UNIQUE(`workspacename`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE no action ON UPDATE no action;