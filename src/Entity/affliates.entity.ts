import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductAffiliateLinkEntity } from './product-affliateLinks';


@Entity({ name: 'affiliates' })
export class AffiliateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @OneToMany(() => ProductAffiliateLinkEntity, (link) => link.affiliate)
  links: ProductAffiliateLinkEntity[];
}
