import { FC, useState } from 'react'
import cn from 'classnames'
import Image from 'next/image'
import { NextSeo } from 'next-seo'

import s from './ProductView.module.css'
import { useUI } from '@components/ui/context'
import { Swatch, ProductSlider } from '@components/product'
import { Button, Container, Text } from '@components/ui'

import usePrice from '@bigcommerce/storefront-data-hooks/use-price'
import useAddItem from '@bigcommerce/storefront-data-hooks/cart/use-add-item'
import type { ProductNode } from '@bigcommerce/storefront-data-hooks/api/operations/get-product'
import {
  getCurrentVariant,
  getProductOptions,
  SelectedOptions
} from '../helpers'
import WishlistButton from '@components/wishlist/WishlistButton'
import _ from 'lodash'
import ContactSellerModal from '../ContactSellerModal'

interface Props {
  className?: string
  children?: any
  product: ProductNode
  data: any
}

const ProductView: FC<Props> = ({ product, data }) => {
  const addItem = useAddItem()
  const { price } = usePrice({
    amount: product.prices?.price?.value,
    baseAmount: product.prices?.retailPrice?.value,
    currencyCode: product.prices?.price?.currencyCode!
  })
  const { openSidebar } = useUI()
  const options = getProductOptions(product)
  const [loading, setLoading] = useState(false)
  const [contactSellerModalVisible, setContactSellerModalVisible] = useState(
    false
  )
  const [choices, setChoices] = useState<SelectedOptions>({
    size: null,
    color: null
  })
  const variant =
    getCurrentVariant(product, choices) || product.variants.edges?.[0]

  const addToCart = async () => {
    setLoading(true)
    try {
      await addItem({
        productId: product.entityId,
        variantId: product.variants.edges?.[0]?.node.entityId!
      })
      openSidebar()
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  return (
    <Container className="max-w-none w-full" clean>
      <NextSeo
        title={product.name}
        description={product.description}
        openGraph={{
          type: 'website',
          title: product.name,
          description: product.description,
          images: [
            {
              url: product.images.edges?.[0]?.node.urlOriginal!,
              width: 800,
              height: 600,
              alt: product.name
            }
          ]
        }}
      />
      <div className={cn(s.root, 'fit')}>
        {/* <div className={cn(s.productDisplay, 'fit')}>
          <div className={s.nameBox}>
            <h1 className={s.name}>{product.name}</h1>
            <div className={s.price}>
              {price} {product.prices?.price.currencyCode}
            </div>
          </div>

          <div className={s.sliderContainer}>
            <ProductSlider>
              {product.images.edges?.map((image, i) => (
                <div key={image?.node.urlOriginal} className={s.imageContainer}>
                  <Image
                    className={s.img}
                    src={image?.node.urlOriginal!}
                    alt={image?.node.altText || 'Product Image'}
                    width={1050}
                    height={1050}
                    priority={i === 0}
                    quality="85"
                  />
                </div>
              ))}
            </ProductSlider>
          </div>
        </div> */}

        <div className={s.sidebar}>
          <section>
            {options?.map((opt: any) => (
              <div className="pb-4" key={opt.displayName}>
                <h2 className="uppercase font-medium">{opt.displayName}</h2>
                <div className="flex flex-row py-4">
                  {opt.values.map((v: any, i: number) => {
                    const active = (choices as any)[opt.displayName]

                    return (
                      <Swatch
                        key={`${v.entityId}-${i}`}
                        active={v.label === active}
                        variant={opt.displayName}
                        color={v.hexColors ? v.hexColors[0] : ''}
                        label={v.label}
                        onClick={() => {
                          setChoices((choices) => {
                            return {
                              ...choices,
                              [opt.displayName]: v.label
                            }
                          })
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            ))}

            <ProductItem product={data} />
          </section>
          <div className="flex justify-center">
            <Button
              aria-label="Contact Seller"
              type="button"
              className={s.button}
              onClick={() => {
                setContactSellerModalVisible(!contactSellerModalVisible)
              }}
              loading={loading}
              disabled={!variant}
            >
              Contact Seller
            </Button>
          </div>
        </div>

        {/* <WishlistButton
          className={s.wishlistButton}
          productId={product.entityId}
          variant={product.variants.edges?.[0]!}
        /> */}
      </div>
      <ContactSellerModal
        show={contactSellerModalVisible}
        onClose={() => setContactSellerModalVisible(false)}
      />
    </Container>
  )
}

export default ProductView

const ProductItem = ({ product }) => {
  const units = _.find(product.custom_fields, {
    name: 'Units'
  })?.value
  const trialRollsOffered =
    _.find(product.custom_fields, {
      name: 'Trial Rolls Offered'
    })?.value === 'true'
      ? '✔️'
      : ''
  const shipsIn24Hours =
    product.availability_description === 'Ships within 24 hours' ? '✔️' : ''
  return (
    <section>
      <div className="px-6 py-4 whitespace-nowrap">
        <div className="text-2xl text-gray-900">{product.sku}</div>
      </div>
      <div className="flex flex-col my-10">
        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {`Price per Unit: $${product.price} / ${units || 'unit'}`}
        </div>
        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          Ships in 24 Hours: {shipsIn24Hours || 'No'}
        </div>
        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          Minimum Order Size: {product.order_quantity_minimum || '10,000'}
          &nbsp;
          {units || 'units'}
        </div>
        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          Maximum width cut:{' '}
          {product.width ? `${product.width}"` : 'Not defined'}
        </div>
        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          Trial Rolls Offered: {trialRollsOffered || 'No'}
        </div>
      </div>
    </section>
  )
}
