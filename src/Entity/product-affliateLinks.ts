import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { ProductEntity } from './products.entity';
import { AffiliateEntity } from './affliates.entity';


@Entity({ name: 'product_affiliate_links' })
export class ProductAffiliateLinkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductEntity, (product) => product.affiliateLinks)
  product: ProductEntity;

  @ManyToOne(() => AffiliateEntity, (affiliate) => affiliate.links)
  affiliate: AffiliateEntity;

  @Column()
  link: string; // The unique affiliate link
}
