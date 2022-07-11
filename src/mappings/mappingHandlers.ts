import { Option, Struct } from '@polkadot/types-codec';
import { Balance } from '@polkadot/types/interfaces';
import { SubstrateEvent } from '@subql/types';
import { Tvl } from '../types';

export async function handleNewEraEvent(event: SubstrateEvent): Promise<void> {
    const {event: {data: [era]}} = event;
    logger.info(`New era: ${era}`);

    const result = await api.query.dappsStaking.generalEraInfo<Option<StakingEraInfo>>(era);
    const tvl = result.unwrap().locked;

    const record = new Tvl(era.toString());
    record.tvl = tvl.toBigInt();
    record.startedAt = event.block.timestamp;
    await record.save();
}

interface StakingEraInfo extends Struct {
    rewards: {
        stakers: Balance;
        dapps: Balance;
    }
    staked: Balance;
    locked: Balance;
}