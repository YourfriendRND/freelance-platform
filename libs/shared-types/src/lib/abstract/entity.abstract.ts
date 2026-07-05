import { IEntity } from './entity';

export abstract class Entity<TProps extends IEntity> implements IEntity {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;

  protected constructor(props?: Partial<TProps>) {
    if (props) {
      this.assign(props);
    }
  }

  protected assign(props: Partial<TProps>): void {
    Object.assign(this, props);
  }

  abstract toObject(): TProps;
}
