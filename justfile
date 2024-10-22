core: esm cjs dts

#standard:
#    just esm standard
#    just cjs standard
#    just dts standard
#
#reactive:
#    just esm reactive
#    just cjs reactive
#    just dts reactive

esm:
   pnpm tsc --project tsconfig.esm.json

cjs:
   pnpm tsc --project tsconfig.cjs.json

dts:
    pnpm tsc --project tsconfig.json --emitDeclarationOnly

test:
    pnpm test
