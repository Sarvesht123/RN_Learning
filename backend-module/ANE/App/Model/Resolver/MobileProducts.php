<?php
declare(strict_types=1);

namespace ANE\App\Model\Resolver;

use Magento\Catalog\Model\Product\Attribute\Source\Status;
use Magento\Catalog\Model\Product\Visibility;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Magento\Framework\App\ResourceConnection;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Framework\GraphQl\Query\Uid;
use Magento\Store\Model\StoreManagerInterface;

class MobileProducts implements ResolverInterface
{
    public function __construct(
        private readonly CollectionFactory $collectionFactory,
        private readonly StoreManagerInterface $storeManager,
        private readonly ResourceConnection $resource,
        private readonly Uid $uid
    ) {
    }

    public function resolve(Field $field, $context, ResolveInfo $info, ?array $value = null, ?array $args = null): array
    {
        $args ??= [];
        $filter = $args['filter'] ?? [];
        $pageSize = max(1, min(50, (int)($args['pageSize'] ?? 20)));
        $currentPage = max(1, (int)($args['currentPage'] ?? 1));
        $store = $this->storeManager->getStore();

        $collection = $this->collectionFactory->create();
        $collection->setStoreId((int)$store->getId())
            ->addStoreFilter((int)$store->getId())
            ->addAttributeToSelect([
                'name', 'url_key', 'price', 'special_price', 'special_from_date', 'special_to_date',
                'small_image', 'description', 'brand', 'product_country', 'size', 'am_product_label'
            ])
            ->addAttributeToFilter('status', Status::STATUS_ENABLED)
            ->setVisibility([Visibility::VISIBILITY_IN_CATALOG, Visibility::VISIBILITY_IN_SEARCH, Visibility::VISIBILITY_BOTH]);

        if (!empty($filter['category_uid'])) {
            $categoryId = (int)$this->uid->decode((string)$filter['category_uid']);
            if ($categoryId > 0) {
                $collection->addCategoriesFilter(['in' => [$categoryId]]);
            }
        }
        if (!empty($filter['sku'])) {
            $collection->addAttributeToFilter('sku', ['eq' => $filter['sku']]);
        }
        if (!empty($args['search'])) {
            $term = trim((string)$args['search']);
            $collection->addAttributeToFilter([
                ['attribute' => 'name', 'like' => '%' . $term . '%'],
                ['attribute' => 'sku', 'like' => '%' . $term . '%']
            ]);
        }
        foreach (['brand', 'product_country', 'size'] as $attribute) {
            if (!empty($filter[$attribute])) {
                $collection->addAttributeToFilter($attribute, ['eq' => $filter[$attribute]]);
            }
        }
        if (isset($filter['max_price'])) {
            $collection->addAttributeToFilter('price', ['lteq' => (float)$filter['max_price']]);
        }

        $sort = $args['sort'] ?? [];
        $requestedSortField = $sort['field'] ?? 'name';
        $sortField = in_array($requestedSortField, ['name', 'price'], true) ? $requestedSortField : 'name';
        $sortDirection = ($sort['direction'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';
        $collection->addAttributeToSort($sortField, $sortDirection);
        $collection->setPageSize($pageSize)->setCurPage($currentPage);

        if (($filter['in_stock'] ?? true) === true) {
            if (!empty($filter['source_code'])) {
                $sourceItemTable = $this->resource->getTableName('inventory_source_item');
                $collection->getSelect()->join(
                    ['mobile_source_stock' => $sourceItemTable],
                    'e.sku = mobile_source_stock.sku',
                    []
                )->where('mobile_source_stock.source_code = ?', (string)$filter['source_code'])
                    ->where('mobile_source_stock.status = ?', 1)
                    ->where('mobile_source_stock.quantity > ?', 0);
            } else {
                $stockTable = $this->resource->getTableName('cataloginventory_stock_status');
                $collection->getSelect()->join(
                    ['mobile_stock' => $stockTable],
                    'e.entity_id = mobile_stock.product_id AND mobile_stock.stock_id = 1',
                    []
                )->where('mobile_stock.stock_status = ?', 1);
            }
        }

        $total = (int)$collection->getSize();
        $mediaBase = rtrim($store->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA), '/');
        $items = [];
        foreach ($collection as $product) {
            $regularPrice = (float)$product->getPrice();
            $finalPrice = (float)$product->getFinalPrice();
            $image = (string)$product->getSmallImage();
            $items[] = [
                'uid' => $this->uid->encode((string)$product->getId()),
                'sku' => (string)$product->getSku(),
                'name' => (string)$product->getName(),
                'url_key' => (string)$product->getUrlKey(),
                'brand' => $this->label($product, 'brand'),
                'product_country' => $this->label($product, 'product_country'),
                'size' => $this->label($product, 'size'),
                'stock_status' => $product->isSalable() ? 'IN_STOCK' : 'OUT_OF_STOCK',
                'am_product_label' => (string)$product->getData('am_product_label'),
                'description' => (string)$product->getDescription(),
                'small_image' => $image && $image !== 'no_selection' ? $mediaBase . '/catalog/product' . $image : null,
                'price' => $finalPrice,
                'regular_price' => $regularPrice,
                'discount_percent' => $regularPrice > 0 ? round((1 - ($finalPrice / $regularPrice)) * 100, 2) : 0.0,
            ];
        }
        return ['total_count' => $total, 'items' => $items];
    }

    private function label($product, string $attributeCode): ?string
    {
        $attribute = $product->getResource()->getAttribute($attributeCode);
        if (!$attribute) {
            return null;
        }
        $value = $attribute->getFrontend()->getValue($product);
        return is_array($value) ? implode(', ', $value) : ($value !== false ? (string)$value : null);
    }
}
