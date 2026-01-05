import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    @Index()
    username: string;

    @Column({ unique: true })
    @Index()
    email: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
