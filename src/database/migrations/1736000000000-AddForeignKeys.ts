import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddForeignKeys1736000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add foreign key for posts -> users
        await queryRunner.createForeignKey(
            'posts',
            new TableForeignKey({
                name: 'FK_posts_users',
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        // Add foreign key for likes -> users
        await queryRunner.createForeignKey(
            'likes',
            new TableForeignKey({
                name: 'FK_likes_users',
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        // Add foreign key for likes -> posts
        await queryRunner.createForeignKey(
            'likes',
            new TableForeignKey({
                name: 'FK_likes_posts',
                columnNames: ['post_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'posts',
                onDelete: 'CASCADE',
            }),
        );

        // Add foreign key for notifications -> users
        await queryRunner.createForeignKey(
            'notifications',
            new TableForeignKey({
                name: 'FK_notifications_users',
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys in reverse order
        await queryRunner.dropForeignKey('notifications', 'FK_notifications_users');
        await queryRunner.dropForeignKey('likes', 'FK_likes_posts');
        await queryRunner.dropForeignKey('likes', 'FK_likes_users');
        await queryRunner.dropForeignKey('posts', 'FK_posts_users');
    }
}
